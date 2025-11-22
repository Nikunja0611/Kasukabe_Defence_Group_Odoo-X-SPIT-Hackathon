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
    stock_quantity = Column(Float, default=0.0) # Cached value for dashboard speed

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