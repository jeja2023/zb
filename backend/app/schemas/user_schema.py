from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    real_name: str
    phone: str
    department: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserInDB(UserBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True 