from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional
from .user_schema import UserResponse

class DutyBase(BaseModel):
    """值班记录基础模型"""
    date: date
    shift: str
    remark: Optional[str] = None

class DutyCreate(DutyBase):
    """创建值班记录请求模型"""
    pass

class DutyUpdate(DutyBase):
    """更新值班记录请求模型"""
    status: int

class DutyInDB(DutyBase):
    """数据库中的值班记录模型"""
    id: int
    user_id: int
    status: int
    created_at: datetime

    class Config:
        from_attributes = True

class DutyResponse(DutyInDB):
    """值班记录响应模型"""
    user: UserResponse

    class Config:
        from_attributes = True 