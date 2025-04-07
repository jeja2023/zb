from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from ...db.base import get_db
from ...db.models import Duty, User
from ...core.security import verify_token
from ...schemas.duty_schema import DutyCreate, DutyUpdate, DutyResponse
import logging

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{duty_id}", response_model=DutyResponse)
async def get_duty(
    duty_id: int,
    db: Session = Depends(get_db)
):
    try:
        logger.debug(f"开始查询值班记录 {duty_id}")
        duty = db.query(Duty).options(joinedload(Duty.user)).filter(Duty.id == duty_id).first()
        if not duty:
            logger.warning(f"值班记录 {duty_id} 不存在")
            raise HTTPException(status_code=404, detail="值班记录不存在")
        return duty
    except Exception as e:
        logger.error(f"查询值班记录时出错: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/date/{date}", response_model=List[DutyResponse])
async def get_duties_by_date(
    date: date,
    db: Session = Depends(get_db)
):
    try:
        logger.debug(f"开始查询日期 {date} 的值班记录")
        duties = db.query(Duty).options(joinedload(Duty.user)).filter(Duty.date == date).all()
        logger.debug(f"找到 {len(duties)} 条值班记录")
        return duties
    except Exception as e:
        logger.error(f"查询值班记录时出错: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.get("/user/{user_id}", response_model=List[DutyResponse])
async def get_duties_by_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        logger.debug(f"开始查询用户 {user_id} 的值班记录")
        # 先检查用户是否存在
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"用户 {user_id} 不存在")
            raise HTTPException(status_code=404, detail="用户不存在")
            
        duties = db.query(Duty).options(joinedload(Duty.user)).filter(Duty.user_id == user_id).all()
        logger.debug(f"找到 {len(duties)} 条值班记录")
        return duties
    except Exception as e:
        logger.error(f"查询值班记录时出错: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.post("", response_model=DutyResponse)
async def create_duty(
    duty: DutyCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    try:
        logger.debug("开始创建值班记录")
        logger.debug(f"收到的 authorization: {authorization}")
        if not authorization:
            logger.warning("请求中未包含 authorization")
            raise HTTPException(status_code=401, detail="未提供认证凭据")
            
        # 从 Authorization 头中提取 token
        try:
            token = authorization.split("Bearer ")[1]
        except IndexError:
            logger.warning("Authorization 头格式错误")
            raise HTTPException(status_code=401, detail="认证凭据格式错误")
            
        payload = verify_token(token)
        if not payload:
            logger.warning("token 验证失败")
            raise HTTPException(status_code=401, detail="无效的认证凭据")
        
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            logger.warning(f"用户 {username} 不存在")
            raise HTTPException(status_code=404, detail="用户不存在")
        
        db_duty = Duty(
            user_id=user.id,
            date=duty.date,
            shift=duty.shift,
            remark=duty.remark
        )
        db.add(db_duty)
        db.commit()
        db.refresh(db_duty)
        # 重新查询以加载关联的用户数据
        db_duty = db.query(Duty).options(joinedload(Duty.user)).filter(Duty.id == db_duty.id).first()
        return db_duty
    except Exception as e:
        logger.error(f"创建值班记录时出错: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.put("/{duty_id}", response_model=DutyResponse)
async def update_duty(
    duty_id: int,
    duty: DutyUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    try:
        logger.debug(f"开始更新值班记录 {duty_id}")
        logger.debug(f"收到的 authorization: {authorization}")
        logger.debug(f"收到的更新数据: {duty.dict()}")
        
        if not authorization:
            logger.warning("请求中未包含 authorization")
            raise HTTPException(status_code=401, detail="未提供认证凭据")
            
        # 从 Authorization 头中提取 token
        try:
            token = authorization.split("Bearer ")[1]
            logger.debug(f"提取的 token: {token}")
        except IndexError:
            logger.warning("Authorization 头格式错误")
            raise HTTPException(status_code=401, detail="认证凭据格式错误")
            
        payload = verify_token(token)
        if not payload:
            logger.warning("token 验证失败")
            raise HTTPException(status_code=401, detail="无效的认证凭据或 token 已过期")
        
        username = payload.get("sub")
        logger.debug(f"token 中的用户名: {username}")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            logger.warning(f"用户 {username} 不存在")
            raise HTTPException(status_code=404, detail="用户不存在")
        
        db_duty = db.query(Duty).filter(Duty.id == duty_id).first()
        if not db_duty:
            logger.warning(f"值班记录 {duty_id} 不存在")
            raise HTTPException(status_code=404, detail="值班记录不存在")
        
        if db_duty.user_id != user.id:
            logger.warning(f"用户 {username} 无权修改值班记录 {duty_id}")
            raise HTTPException(status_code=403, detail="无权修改此值班记录")
        
        # 记录更新前的数据
        logger.debug(f"更新前的值班记录: {db_duty.__dict__}")
        
        # 更新数据
        for key, value in duty.dict(exclude_unset=True).items():
            logger.debug(f"更新字段 {key}: {value}")
            setattr(db_duty, key, value)
        
        # 记录更新后的数据
        logger.debug(f"更新后的值班记录: {db_duty.__dict__}")
        
        db.commit()
        db.refresh(db_duty)
        # 重新查询以加载关联的用户数据
        db_duty = db.query(Duty).options(joinedload(Duty.user)).filter(Duty.id == db_duty.id).first()
        return db_duty
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"更新值班记录时出错: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@router.delete("/{duty_id}")
async def delete_duty(
    duty_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    try:
        logger.debug(f"开始删除值班记录 {duty_id}")
        logger.debug(f"收到的 authorization: {authorization}")
        if not authorization:
            logger.warning("请求中未包含 authorization")
            raise HTTPException(status_code=401, detail="未提供认证凭据")
            
        # 从 Authorization 头中提取 token
        try:
            token = authorization.split("Bearer ")[1]
        except IndexError:
            logger.warning("Authorization 头格式错误")
            raise HTTPException(status_code=401, detail="认证凭据格式错误")
            
        payload = verify_token(token)
        if not payload:
            logger.warning("token 验证失败")
            raise HTTPException(status_code=401, detail="无效的认证凭据")
        
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            logger.warning(f"用户 {username} 不存在")
            raise HTTPException(status_code=404, detail="用户不存在")
        
        db_duty = db.query(Duty).filter(Duty.id == duty_id).first()
        if not db_duty:
            logger.warning(f"值班记录 {duty_id} 不存在")
            raise HTTPException(status_code=404, detail="值班记录不存在")
        
        if db_duty.user_id != user.id:
            logger.warning(f"用户 {username} 无权删除值班记录 {duty_id}")
            raise HTTPException(status_code=403, detail="无权删除此值班记录")
        
        db.delete(db_duty)
        db.commit()
        return {"message": "删除成功"}
    except Exception as e:
        logger.error(f"删除值班记录时出错: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}") 