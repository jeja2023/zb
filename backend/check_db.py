from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.models import User

# 创建数据库引擎
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_users():
    db = SessionLocal()
    try:
        # 查询所有用户
        users = db.query(User).all()
        print("\n数据库中的用户列表:")
        print("-" * 50)
        for user in users:
            print(f"ID: {user.id}")
            print(f"用户名: {user.username}")
            print(f"真实姓名: {user.real_name}")
            print(f"部门: {user.department}")
            print(f"创建时间: {user.created_at}")
            print("-" * 50)
    finally:
        db.close()

def delete_user(username):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            db.delete(user)
            db.commit()
            print(f"\n成功删除用户: {username}")
        else:
            print(f"\n未找到用户: {username}")
    except Exception as e:
        db.rollback()
        print(f"\n删除用户时出错: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    # 删除 test 用户
    delete_user("test")
    # 显示更新后的用户列表
    check_users() 