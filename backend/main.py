from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import models, schemas, database
import random, string

# --- CONFIG ---
SECRET_KEY = "hackathon_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Use Argon2 for Python 3.13 compatibility
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="StockMaster API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPERS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Create DB Tables
models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTH ENDPOINTS ---

@app.post("/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Unique Login ID
    if db.query(models.User).filter(models.User.login_id == user.login_id).first():
        raise HTTPException(status_code=400, detail="Login ID already exists")

    # 2. Unique Email
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 3. Create
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(
        login_id=user.login_id,
        email=user.email, 
        hashed_password=hashed_pw,
        role=user.role 
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Note: OAuth2 form sends 'username', we map it to 'login_id'
    user = db.query(models.User).filter(models.User.login_id == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login Id or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.login_id})
    
    # Return Role so Frontend can hide buttons
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role 
    }

# --- OTP ENDPOINTS ---
@app.post("/auth/forgot-password")
def forgot_password(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    
    otp_code = ''.join(random.choices(string.digits, k=6))
    db.query(models.OTP).filter(models.OTP.email == request.email).delete()
    
    new_otp = models.OTP(email=request.email, code=otp_code)
    db.add(new_otp)
    db.commit()
    
    return {"message": "OTP Sent", "debug_otp": otp_code}

@app.post("/auth/reset-password")
def reset_password(request: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    otp_record = db.query(models.OTP).filter(
        models.OTP.email == request.email, 
        models.OTP.code == request.otp
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user = db.query(models.User).filter(models.User.email == request.email).first()
    user.hashed_password = get_password_hash(request.new_password)
    
    db.delete(otp_record)
    db.commit()
    return {"message": "Password reset successfully"}

# --- APP ENDPOINTS ---

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
        return {"message": "Seeded"}
    return {"message": "Already seeded"}

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

@app.post("/moves")
def create_move(move: schemas.MoveCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == move.product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    
    source = db.query(models.Location).filter(models.Location.id == move.source_id).first()
    
    if source.type == "internal" and product.stock_quantity < move.qty:
        raise HTTPException(status_code=400, detail=f"Not enough stock! Available: {product.stock_quantity}")

    new_move = models.StockMove(
        product_id=move.product_id, source_id=move.source_id, 
        dest_id=move.dest_id, qty=move.qty, type=move.type
    )
    
    if source.type in ["vendor", "adjustment"]:
        product.stock_quantity += move.qty
    elif source.type == "internal":
        product.stock_quantity -= move.qty
        dest = db.query(models.Location).filter(models.Location.id == move.dest_id).first()
        if dest.type == "internal":
            product.stock_quantity += move.qty 
            
    db.add(new_move)
    db.commit()
    return {"message": "Success", "new_stock": product.stock_quantity}

@app.get("/moves/history")
def get_move_history(db: Session = Depends(get_db)):
    return db.query(models.StockMove).order_by(models.StockMove.created_at.desc()).all()

@app.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    low_stock = db.query(models.Product).filter(models.Product.stock_quantity < 10).count()
    moves = db.query(models.StockMove).order_by(models.StockMove.id.desc()).limit(5).all()
    return {"total_products": total_products, "low_stock": low_stock, "recent_moves": moves}