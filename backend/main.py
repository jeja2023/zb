import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import engine, Base
from app.api.v1 import auth, duty

# 确保数据目录存在
os.makedirs("data", exist_ok=True)

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="值班管理系统",
    description="一个简单的值班管理系统API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(duty.router, prefix="/api/duty", tags=["duty"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 