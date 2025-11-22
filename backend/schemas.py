from pydantic import BaseModel, validator, EmailStr
from typing import Optional
from datetime import datetime
import re

# --- PRODUCTS ---
class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None

# --- MOVES ---
class MoveCreate(BaseModel):
    product_id: int
    source_id: int
    dest_id: int
    qty: float
    type: str

class AdjustmentCreate(BaseModel):
    product_id: int
    location_id: int
    counted_qty: float
    reason: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str  # draft, waiting, ready, done, canceled

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    login_id: Optional[str] = None

# --- USERS (Strict Validation) ---
class UserCreate(BaseModel):
    login_id: str
    email: EmailStr
    password: str
    role: str

    @validator('login_id')
    def validate_login_id(cls, v):
        if not (6 <= len(v) <= 12):
            raise ValueError('Login ID must be between 6 and 12 characters')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) <= 8:
            raise ValueError('Password must be more than 8 characters')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one Uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one Lowercase letter')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one Special character')
        return v

# --- FORGOT PASSWORD ---
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# --- RESPONSE SCHEMAS ---
class LocationResponse(BaseModel):
    id: int
    name: str
    type: str
    
    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category: Optional[str] = None
    
    class Config:
        from_attributes = True

class MoveResponse(BaseModel):
    id: int
    product_id: int
    source_id: int
    dest_id: int
    qty: float
    type: str
    status: str
    created_at: datetime
    product: Optional[ProductResponse] = None
    source: Optional[LocationResponse] = None
    dest: Optional[LocationResponse] = None
    
    class Config:
        from_attributes = True