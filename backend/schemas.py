from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float

class MoveCreate(BaseModel):
    product_id: int
    source_id: int
    dest_id: int
    qty: float
    type: str