from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    type = Column(String(50)) # vendor, customer, internal, loss

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    sku = Column(String(50), unique=True, index=True)
    category = Column(String(50))
    price = Column(Float)
    stock_quantity = Column(Float, default=0.0)

class StockMove(Base):
    __tablename__ = "stock_moves"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    source_id = Column(Integer, ForeignKey("locations.id"))
    dest_id = Column(Integer, ForeignKey("locations.id"))
    qty = Column(Float)
    type = Column(String(50)) # receipt, delivery, internal
    status = Column(String(20), default="done")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
    source = relationship("Location", foreign_keys=[source_id])
    dest = relationship("Location", foreign_keys=[dest_id])

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    login_id = Column(String(50), unique=True, index=True) # Login ID
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    role = Column(String(50), default="staff") # manager / staff

class OTP(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), index=True)
    code = Column(String(6))
    created_at = Column(DateTime(timezone=True), server_default=func.now())