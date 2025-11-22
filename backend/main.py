from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database

app = FastAPI(title="StockMaster API")

# Allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Tables
models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SEED DATA ENDPOINT (Run this once) ---
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
        # Note: If dest is also internal, we should add it back? 
        # For simplicity in hackathon: 
        # If Source=Internal & Dest=Internal (Transfer), stock stays same globally, 
        # but strictly speaking, this model tracks global count. 
        # For simple logic:
        dest = db.query(models.Location).filter(models.Location.id == move.dest_id).first()
        if dest.type == "internal":
            product.stock_quantity += move.qty # Cancel out the subtraction
            
    db.add(new_move)
    db.commit()
    return {"message": "Transfer Successful", "new_stock": product.stock_quantity}

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