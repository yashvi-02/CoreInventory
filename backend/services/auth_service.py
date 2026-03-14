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

    @staticmethod
    def request_reset_otp(email):
        import random
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError("User not found")
        otp = str(random.randint(100000, 999999))
        user.reset_otp = otp
        user.reset_otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        db.session.commit()
        return {"message": "OTP sent", "otp": otp} # Returning OTP for hackathon ease

    @staticmethod
    def verify_otp(email, otp):
        user = User.query.filter_by(email=email).first()
        if not user or user.reset_otp != otp or user.reset_otp_expiry < datetime.datetime.utcnow():
            raise ValueError("Invalid or expired OTP")
        return {"message": "OTP verified successfully"}

    @staticmethod
    def reset_password(email, otp, new_password):
        user = User.query.filter_by(email=email).first()
        if not user or user.reset_otp != otp or user.reset_otp_expiry < datetime.datetime.utcnow():
            raise ValueError("Invalid or expired OTP")
        
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')
        user.password_hash = hashed_password
        user.reset_otp = None
        user.reset_otp_expiry = None
        db.session.commit()
        return {"message": "Password reset successfully"}

    @staticmethod
    def get_profile(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        return user.to_dict()

    @staticmethod
    def update_profile(user_id, data):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        if "name" in data:
            user.name = data["name"]
        if "email" in data:
            user.email = data["email"]
        db.session.commit()
        return user.to_dict()
