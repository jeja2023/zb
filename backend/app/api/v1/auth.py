from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...db.models import User
from ...core.config import settings
from ...core.security import verify_password, create_access_token, verify_token, get_password_hash
from ...schemas.user_schema import UserCreate, Token, UserResponse

router = APIRouter()

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"用户名 '{user.username}' 已被使用，请选择其他用户名"
        )
    
    # 对密码进行加密处理
    hashed_password = get_password_hash(user.password)
    
    try:
        db_user = User(
            username=user.username,
            password=hashed_password,
            real_name=user.real_name,
            phone=user.phone,
            department=user.department
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        )

@router.get("/profile", response_model=UserResponse)
async def get_profile(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证凭据")
        
    try:
        token = authorization.split("Bearer ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="认证凭据格式错误")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="无效的认证凭据")
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return user

@router.get("/verify-token")
async def verify_token_validity(authorization: str = Header(None), db: Session = Depends(get_db)):
    """验证token是否有效,如果有效则返回成功"""
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证凭据")
        
    try:
        token = authorization.split("Bearer ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="认证凭据格式错误")
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="无效的认证凭据")
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return {"status": "success", "message": "Token有效"} 