from models.user_model import User
from extensions.db import db
import bcrypt
from flask_jwt_extended import create_access_token
import datetime

class AuthService:
    @staticmethod
    def register(data):
        required_fields = ["name", "email", "password", "role"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        salt = bcrypt.gensalt()
        hashed_password_bytes = bcrypt.hashpw(data["password"].encode('utf-8'), salt)
        hashed_password = hashed_password_bytes.decode('utf-8')

        user = User(
            name=data["name"],
            email=data["email"],
            password_hash=hashed_password,
            role=data["role"]
        )

        try:
            db.session.add(user)
            db.session.commit()
            return user
        except Exception as e:
            db.session.rollback()
            if "duplicate key value violates unique constraint" in str(e).lower() or "unique constraint" in str(e).lower():
                raise FileExistsError(f"Email '{data['email']}' is already registered")
            raise Exception("Failed to register user")

    @staticmethod
    def login(data):
        if not data or "email" not in data or "password" not in data:
            raise ValueError("Missing email or password")

        user = User.query.filter_by(email=data["email"]).first()

        if not user:
            raise PermissionError("User not found")

        if not bcrypt.checkpw(data["password"].encode('utf-8'), user.password_hash.encode('utf-8')):
            raise PermissionError("Invalid password")

        expires = datetime.timedelta(days=7)
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)
        
        return {
            "token": access_token,
            "role": user.role
        }
