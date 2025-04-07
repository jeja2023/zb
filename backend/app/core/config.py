import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 数据库配置
    BASE_DIR: str = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'data', 'duty.db')}"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key"  # 请修改为安全的密钥
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "allow"  # 允许额外的配置项

settings = Settings() 