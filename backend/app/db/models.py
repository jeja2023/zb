from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    password = Column(String(120), nullable=False)
    real_name = Column(String(80))
    phone = Column(String(20))
    department = Column(String(80))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    duties = relationship("Duty", back_populates="user")

class Duty(Base):
    __tablename__ = "duties"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    shift = Column(String(20), nullable=False)  # 早班、中班、晚班
    status = Column(Integer, default=1)  # 1: 正常, 0: 已取消
    remark = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="duties") 