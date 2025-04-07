# 值班管理小程序

这是一个基于微信小程序和FastAPI的值班管理系统。系统包含前端小程序和后端API服务两个部分。

## 项目结构

```
.
├── backend/                # 后端服务
│   ├── app/               # 应用主目录
│   │   ├── api/          # API接口
│   │   ├── core/         # 核心配置
│   │   ├── db/           # 数据库模型
│   │   └── schemas/      # 数据模式
│   ├── data/             # 数据文件
│   ├── main.py           # 主程序入口
│   └── requirements.txt   # 依赖包列表
│
└── miniprogram/          # 微信小程序前端
    ├── pages/            # 页面文件
    │   ├── duty/        # 值班相关页面
    │   ├── index/       # 首页
    │   ├── login/       # 登录页
    │   └── register/    # 注册页
    ├── utils/           # 工具函数
    ├── app.js           # 小程序入口文件
    └── app.json         # 小程序配置文件

```

## 功能特性

- 用户认证：
  - 用户注册和登录
  - JWT token认证
  - 自动登录和token验证
- 值班管理：
  - 查看值班列表
  - 添加新的值班记录
  - 编辑现有值班记录
  - 删除值班记录
- 数据安全：
  - 密码加密存储
  - Token过期处理
  - 权限验证

## 技术栈

### 后端
- FastAPI - 现代、快速的Web框架
- SQLite - 轻量级数据库
- JWT - 用户认证
- Python 3.8+
- SQLAlchemy - ORM框架
- Pydantic - 数据验证

### 前端
- 微信小程序原生框架
- Promise封装的HTTP请求
- 本地存储管理
- 响应式UI设计

## 开始使用

### 后端服务

1. 进入后端目录：
```bash
cd backend
```

2. 创建虚拟环境并激活：
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 运行服务：
```bash
uvicorn main:app --reload
```

服务将在 http://localhost:8000 运行，API文档可在 http://localhost:8000/docs 查看。

### 前端小程序

1. 使用微信开发者工具打开miniprogram目录
2. 在project.config.json中配置您的小程序appid
3. 在utils/http.js中配置后端服务地址（默认：http://localhost:8000）

## 配置说明

### 后端配置
在backend/.env文件中配置：
- SECRET_KEY - JWT密钥
- ALGORITHM - JWT算法（默认：HS256）
- ACCESS_TOKEN_EXPIRE_MINUTES - Token过期时间（默认：60分钟）
- DATABASE_URL - 数据库连接URL

### 前端配置
在miniprogram/utils/http.js中配置：
- BASE_URL - 后端API地址

## API接口

### 认证相关
- POST /api/auth/register - 用户注册
- POST /api/auth/token - 用户登录
- GET /api/auth/profile - 获取用户信息
- GET /api/auth/verify-token - 验证token有效性

### 值班相关
- GET /api/duty - 获取值班列表
- POST /api/duty - 创建值班记录
- PUT /api/duty/{id} - 更新值班记录
- DELETE /api/duty/{id} - 删除值班记录
- GET /api/duty/user/{id} - 获取用户的值班记录

## 开发说明

### 数据库
系统使用SQLite数据库，数据文件位于backend/data/duty.db。

### 安全说明
- 所有密码都使用bcrypt加密存储
- JWT token用于用户认证
- 敏感操作需要验证token
- 建议在生产环境中使用更安全的数据库系统

## 注意事项

- 请确保后端服务的SECRET_KEY安全性
- 在生产环境中建议使用更安全的数据库系统
- 注意保护用户数据隐私
- 定期备份数据库文件 