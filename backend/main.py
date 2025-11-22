from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import models, schemas, database

# --- AUTH CONFIG ---
SECRET_KEY = "hackathon_secret_key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") # Updated token URL

app = FastAPI(title="StockMaster API")

# Allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH FUNCTIONS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Create Tables (Make sure models.User is in models.py before running this)
models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTH ENDPOINTS (NEW) ---

@app.post("/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user_exists = db.query(models.User).filter(models.User.email == user.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create User
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw, role="manager")
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Authenticate
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate Token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- SEED DATA ENDPOINT ---
@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    if db.query(models.Location).count() == 0:
        locs = [
            models.Location(name="Partners/Vendors", type="vendor"),
            models.Location(name="WH/Stock", type="internal"),
            models.Location(name="Partners/Customers", type="customer"),
            models.Location(name="Inventory Loss", type="loss"),
        ]
        db.add_all(locs)
        db.commit()
        return {"message": "Locations Seeded: 1=Vendor, 2=Stock, 3=Customer, 4=Loss"}
    return {"message": "Already seeded"}

# --- PRODUCTS ---
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.post("/products")
def create_product(item: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_item = models.Product(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# --- OPERATIONS (THE CORE LOGIC) ---
@app.post("/moves")
def create_move(move: schemas.MoveCreate, db: Session = Depends(get_db)):
    # 1. Get Product
    product = db.query(models.Product).filter(models.Product.id == move.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # 2. Get Locations
    source = db.query(models.Location).filter(models.Location.id == move.source_id).first()
    
    # 3. VALIDATION: If moving FROM internal stock, check availability
    if source.type == "internal":
        if product.stock_quantity < move.qty:
            raise HTTPException(status_code=400, detail=f"Not enough stock! Available: {product.stock_quantity}")

    # 4. Record Move
    new_move = models.StockMove(
        product_id=move.product_id, source_id=move.source_id, 
        dest_id=move.dest_id, qty=move.qty, type=move.type
    )
    
    # 5. Update Stock Cache
    if source.type == "vendor" or source.type == "adjustment": # Incoming
        product.stock_quantity += move.qty
    elif source.type == "internal": # Outgoing
        product.stock_quantity -= move.qty
        
        # Internal Transfer Logic (Cancel out subtraction if moving to internal)
        dest = db.query(models.Location).filter(models.Location.id == move.dest_id).first()
        if dest.type == "internal":
            product.stock_quantity += move.qty 
            
    db.add(new_move)
    db.commit()
    return {"message": "Transfer Successful", "new_stock": product.stock_quantity}

# --- MOVE HISTORY (NEW) ---
@app.get("/moves/history")
def get_move_history(db: Session = Depends(get_db)):
    # Returns all moves, newest first
    return db.query(models.StockMove).order_by(models.StockMove.created_at.desc()).all()

# --- DASHBOARD ---
@app.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    low_stock = db.query(models.Product).filter(models.Product.stock_quantity < 10).count()
    moves = db.query(models.StockMove).order_by(models.StockMove.id.desc()).limit(5).all()
    return {
        "total_products": total_products,
        "low_stock": low_stock,
        "recent_moves": moves
    }