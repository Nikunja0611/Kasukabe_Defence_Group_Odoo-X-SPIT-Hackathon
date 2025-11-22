from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List
import models, schemas, database
import random
import string
import smtplib
from email.mime.text import MIMEText

# --- CONFIG ---
SECRET_KEY = "hackathon_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- EMAIL CONFIGURATION ---
# 1. ENTER YOUR GMAIL ADDRESS HERE:
SENDER_EMAIL = "stockops.ims@gmail.com" 

# 2. YOUR APP PASSWORD (Pre-filled):
SENDER_PASSWORD = "bxhh nzch fkxf ylxl" 

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

# --- EMAIL SENDING FUNCTION (REAL SMTP) ---
def send_otp_email(to_email, otp_code):
    try:
        # Create Email Content
        subject = "StockOps Password Reset"
        body = f"Your One-Time Password (OTP) for resetting your password is: {otp_code}\n\nThis code expires in 10 minutes."
        
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email

        # Connect to Gmail SMTP (Port 587 for TLS)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Secure the connection
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email Failed. Error: {e}")
        return False

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

# --- OTP ENDPOINTS (UPDATED FOR REAL EMAIL) ---
@app.post("/auth/forgot-password")
def forgot_password(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    # 1. Check if user exists
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    
    # 2. Generate OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    # 3. Save to DB (Delete old OTPs first)
    db.query(models.OTP).filter(models.OTP.email == request.email).delete()
    new_otp = models.OTP(email=request.email, code=otp_code)
    db.add(new_otp)
    db.commit()
    
    # 4. Send Real Email
    success = send_otp_email(request.email, otp_code)
    
    if not success:
        # If email fails, return 500 error so frontend knows
        raise HTTPException(status_code=500, detail="Failed to send email. Check server logs.")
        
    return {"message": "OTP Sent to your email"}

# --- NEW ENDPOINT: VERIFY OTP ---
@app.post("/auth/verify-otp")
def verify_otp(request: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    # Note: We reuse PasswordResetConfirm schema but ignore password fields here
    otp_record = db.query(models.OTP).filter(
        models.OTP.email == request.email, 
        models.OTP.code == request.otp
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or Expired OTP")
    
    return {"message": "OTP Verified"}

@app.post("/auth/reset-password")
def reset_password(request: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    # 1. Verify OTP AGAIN (Security Check)
    otp_record = db.query(models.OTP).filter(
        models.OTP.email == request.email, 
        models.OTP.code == request.otp
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or Expired OTP")
    
    # 2. Update Password
    user = db.query(models.User).filter(models.User.email == request.email).first()
    user.hashed_password = get_password_hash(request.new_password)
    
    # 3. Delete OTP
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

@app.post("/moves/adjustment")
def create_adjustment(adjustment: schemas.AdjustmentCreate, db: Session = Depends(get_db)):
    # 1. Validate product exists
    product = db.query(models.Product).filter(models.Product.id == adjustment.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # 2. Validate location exists
    location = db.query(models.Location).filter(models.Location.id == adjustment.location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # 3. Get current stock
    current_stock = product.stock_quantity
    
    # 4. Calculate difference (counted - current)
    difference = adjustment.counted_qty - current_stock
    
    # 5. Get Inventory Loss location (ID: 4)
    inventory_loss = db.query(models.Location).filter(models.Location.type == "loss").first()
    if not inventory_loss:
        raise HTTPException(status_code=500, detail="Inventory Loss location not found. Please seed database.")
    
    # 6. Create adjustment move
    # Source = Inventory Loss, Dest = Target Location
    # If difference is positive: stock increases (from loss to location)
    # If difference is negative: stock decreases (from location to loss)
    if difference > 0:
        # Stock increase: Inventory Loss -> Location
        source_id = inventory_loss.id
        dest_id = adjustment.location_id
        qty = abs(difference)
    elif difference < 0:
        # Stock decrease: Location -> Inventory Loss
        source_id = adjustment.location_id
        dest_id = inventory_loss.id
        qty = abs(difference)
    else:
        # No change needed, but still log it
        source_id = inventory_loss.id
        dest_id = adjustment.location_id
        qty = 0
    
    new_move = models.StockMove(
        product_id=adjustment.product_id,
        source_id=source_id,
        dest_id=dest_id,
        qty=qty,
        type="adjustment",
        status="draft"
    )
    
    # 7. Update stock quantity
    product.stock_quantity = adjustment.counted_qty
    
    db.add(new_move)
    db.commit()
    db.refresh(new_move)
    
    return {
        "message": "Adjustment created successfully",
        "current_stock": current_stock,
        "counted_qty": adjustment.counted_qty,
        "difference": difference,
        "new_stock": product.stock_quantity,
        "move_id": new_move.id
    }

@app.get("/moves/history", response_model=List[schemas.MoveResponse])
def get_move_history(db: Session = Depends(get_db)):
    moves = db.query(models.StockMove)\
        .options(joinedload(models.StockMove.product), 
                 joinedload(models.StockMove.source), 
                 joinedload(models.StockMove.dest))\
        .order_by(models.StockMove.created_at.desc()).all()
    return moves

@app.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()

@app.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    # 1. Basic Product Stats
    total_products = db.query(models.Product).count()
    low_stock = db.query(models.Product).filter(models.Product.stock_quantity < 10).count()
    
    # 2. Recent Moves (Limit 5) - Include relationships
    moves = db.query(models.StockMove)\
        .options(joinedload(models.StockMove.product), 
                 joinedload(models.StockMove.source), 
                 joinedload(models.StockMove.dest))\
        .order_by(models.StockMove.created_at.desc()).limit(5).all()

    # 3. Calculate Receipt Stats
    # "To Process" = Status is NOT done (assuming 'draft' or similar)
    receipts_to_process = db.query(models.StockMove).filter(
        models.StockMove.type == 'receipt',
        models.StockMove.status != 'done'
    ).count()
    
    receipts_total = db.query(models.StockMove).filter(models.StockMove.type == 'receipt').count()
    
    # Mocking 'late' logic for hackathon (e.g., if older than 2 days and not done)
    # In production, compare created_at with datetime.now()
    receipts_late = 0 

    # 4. Calculate Delivery Stats
    deliveries_to_process = db.query(models.StockMove).filter(
        models.StockMove.type == 'delivery',
        models.StockMove.status != 'done'
    ).count()
    
    deliveries_total = db.query(models.StockMove).filter(models.StockMove.type == 'delivery').count()
    deliveries_late = 0
    deliveries_waiting = 0 # Placeholder
    
    # 5. Calculate Internal Transfer Stats
    internal_transfers_scheduled = db.query(models.StockMove).filter(
        models.StockMove.type == 'internal',
        models.StockMove.status != 'done'
    ).count()

    return {
        "total_products": total_products,
        "low_stock": low_stock,
        "recent_moves": moves,
        "internal_transfers_scheduled": internal_transfers_scheduled,
        # New Nested Data for UI
        "receipts": {
            "to_process": receipts_to_process,
            "late": receipts_late,
            "total": receipts_total
        },
        "deliveries": {
            "to_process": deliveries_to_process,
            "late": deliveries_late,
            "waiting": deliveries_waiting,
            "total": deliveries_total
        }
    }