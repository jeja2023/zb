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

- 用户认证：支持用户注册和登录
- 值班管理：
  - 查看值班列表
  - 添加新的值班记录
  - 编辑现有值班记录
  - 删除值班记录
- JWT token认证
- SQLite数据存储

## 技术栈

### 后端
- FastAPI - 现代、快速的Web框架
- SQLite - 轻量级数据库
- JWT - 用户认证
- Python 3.8+

### 前端
- 微信小程序原生框架
- Promise封装的HTTP请求

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

### 前端小程序

1. 使用微信开发者工具打开miniprogram目录
2. 在project.config.json中配置您的小程序appid
3. 在utils/http.js中配置后端服务地址

## 配置说明

### 后端配置
在backend/.env文件中配置：
- SECRET_KEY - JWT密钥
- ALGORITHM - JWT算法
- DATABASE_URL - 数据库连接URL

### 前端配置
在miniprogram/utils/http.js中配置：
- BASE_URL - 后端API地址

## 开发说明

### API文档
启动后端服务后，访问 http://localhost:8000/docs 查看完整的API文档。

### 数据库
系统使用SQLite数据库，数据文件位于backend/data/duty.db。

## 注意事项

- 请确保后端服务的SECRET_KEY安全性
- 在生产环境中建议使用更安全的数据库系统
- 注意保护用户数据隐私 