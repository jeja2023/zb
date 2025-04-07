from datetime import datetime, date
import os
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base, get_db
from app.db.models import User, Duty

def insert_test_data():
    try:
        # 确保数据目录存在
        data_dir = os.path.dirname(settings.DATABASE_URL.replace('sqlite:///', ''))
        os.makedirs(data_dir, exist_ok=True)
        
        print(f"数据目录: {data_dir}")
        
        # 创建数据库引擎
        engine = create_engine(settings.DATABASE_URL)
        
        print("创建数据库表...")
        # 创建数据库表
        Base.metadata.create_all(bind=engine)
        print("数据库表创建成功！")
        
        # 测试用户数据
        test_users = [
            {
                'username': 'zhangsan',
                'password': get_password_hash('123456'),
                'real_name': '张三',
                'phone': '13800138001',
                'department': '技术部',
                'created_at': datetime.now()
            },
            {
                'username': 'lisi',
                'password': get_password_hash('123456'),
                'real_name': '李四',
                'phone': '13800138002',
                'department': '运维部',
                'created_at': datetime.now()
            },
            {
                'username': 'wangwu',
                'password': get_password_hash('123456'),
                'real_name': '王五',
                'phone': '13800138003',
                'department': '技术部',
                'created_at': datetime.now()
            }
        ]
        
        # 测试值班数据
        test_duties = [
            {
                'user_id': 1,  # 张三的值班记录
                'date': date(2024, 4, 8),
                'shift': '早班',
                'status': 1,
                'remark': '正常值班',
                'created_at': datetime.now()
            },
            {
                'user_id': 1,
                'date': date(2024, 4, 9),
                'shift': '晚班',
                'status': 1,
                'remark': '临时调班',
                'created_at': datetime.now()
            },
            {
                'user_id': 2,  # 李四的值班记录
                'date': date(2024, 4, 8),
                'shift': '中班',
                'status': 1,
                'remark': '正常值班',
                'created_at': datetime.now()
            },
            {
                'user_id': 3,  # 王五的值班记录
                'date': date(2024, 4, 10),
                'shift': '早班',
                'status': 0,
                'remark': '已取消',
                'created_at': datetime.now()
            }
        ]
        
        print("开始插入测试数据...")
        # 获取数据库连接
        with engine.connect() as connection:
            # 插入用户数据
            print("插入用户数据...")
            for user in test_users:
                connection.execute(
                    text("""
                    INSERT INTO users (username, password, real_name, phone, department, created_at)
                    VALUES (:username, :password, :real_name, :phone, :department, :created_at)
                    """),
                    user
                )
            
            # 插入值班数据
            print("插入值班数据...")
            for duty in test_duties:
                connection.execute(
                    text("""
                    INSERT INTO duties (user_id, date, shift, status, remark, created_at)
                    VALUES (:user_id, :date, :shift, :status, :remark, :created_at)
                    """),
                    duty
                )
            
            # 提交事务
            connection.commit()
            
            print("测试数据插入成功！")
            
    except Exception as e:
        print(f"插入测试数据时出错：{str(e)}")
        raise

if __name__ == "__main__":
    insert_test_data() 