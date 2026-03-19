import random
from models.user_model import User
from extensions.db import db
import bcrypt
from flask_jwt_extended import create_access_token
import datetime
from flask import current_app


class AuthService:
    @staticmethod
    def _generate_otp():
        return str(random.randint(100000, 999999))

    @staticmethod
    def _dev_otp_payload(key, otp):
        if current_app.config.get("TESTING") or not current_app.config.get("MAIL_SERVER"):
            return {key: otp}
        return {}

    @staticmethod
    def _send_or_return_otp(email, otp, subject, purpose, dev_key):
        from services.email_service import send_otp_email, is_email_configured

        if is_email_configured():
            sent = send_otp_email(email, otp, subject, purpose)
            if not sent:
                raise ValueError("Failed to send OTP email. Please try again or contact support.")
            return {}

        return AuthService._dev_otp_payload(dev_key, otp)

    @staticmethod
    def register(data):
        required_fields = ["name", "email", "password", "role"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        role = data["role"]
        if role == "staff":
            role = "warehouse_staff"

        if role == "warehouse_staff" and not data.get("warehouse_id"):
            raise ValueError("warehouse_id is required for warehouse staff")

        salt = bcrypt.gensalt()
        hashed_password_bytes = bcrypt.hashpw(data["password"].encode("utf-8"), salt)
        hashed_password = hashed_password_bytes.decode("utf-8")
        verification_otp = AuthService._generate_otp()

        user = User(
            name=data["name"],
            email=data["email"],
            password_hash=hashed_password,
            role=role,
            warehouse_id=data.get("warehouse_id") if role == "warehouse_staff" else None,
            email_verified=False,
            email_verification_otp=verification_otp,
            email_verification_otp_expiry=datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
        )

        try:
            db.session.add(user)
            db.session.commit()
            payload = {
                "pending_verification": True,
                "email": user.email,
            }
            payload.update(
                AuthService._send_or_return_otp(
                    user.email,
                    verification_otp,
                    "Verify your CoreInventory account",
                    "email verification",
                    "development_otp",
                )
            )
            return payload
        except Exception as e:
            db.session.rollback()
            err = str(e).lower()
            if "duplicate" in err or "unique constraint" in err:
                raise FileExistsError(f"Email '{data['email']}' is already registered")
            raise Exception("Failed to register user")

    @staticmethod
    def verify_email(email, otp):
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError("User not found")
        if user.email_verified:
            return {"email_verified": True, "email": user.email}
        if user.email_verification_otp != otp:
            raise ValueError("Invalid verification code")
        if not user.email_verification_otp_expiry or user.email_verification_otp_expiry < datetime.datetime.utcnow():
            raise ValueError("Verification code expired. Please request a new one.")

        user.email_verified = True
        user.email_verification_otp = None
        user.email_verification_otp_expiry = None
        db.session.commit()
        return {"email_verified": True, "email": user.email}

    @staticmethod
    def resend_verification(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError("User not found")
        if user.email_verified:
            return {"email_verified": True, "email": user.email}

        otp = AuthService._generate_otp()
        user.email_verification_otp = otp
        user.email_verification_otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        db.session.commit()

        payload = {"pending_verification": True, "email": user.email}
        payload.update(
            AuthService._send_or_return_otp(
                user.email,
                otp,
                "Verify your CoreInventory account",
                "email verification",
                "development_otp",
            )
        )
        return payload

    @staticmethod
    def login(data):
        """Validate credentials, generate OTP, send via email (or return for dev). Returns pending_otp, never token."""
        if not data or "email" not in data or "password" not in data:
            raise ValueError("Missing email or password")

        user = User.query.filter_by(email=data["email"]).first()
        if not user:
            raise PermissionError("User not found")

        if not bcrypt.checkpw(data["password"].encode("utf-8"), user.password_hash.encode("utf-8")):
            raise PermissionError("Invalid password")

        if not user.email_verified:
            raise PermissionError("Please verify your email before signing in.")

        otp = AuthService._generate_otp()
        user.login_otp = otp
        user.login_otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        db.session.commit()

        result = {"pending_otp": True, "email": user.email}
        result.update(
            AuthService._send_or_return_otp(
                user.email,
                otp,
                "Your CoreInventory Login Verification Code",
                "login verification",
                "development_otp",
            )
        )
        return result

    @staticmethod
    def verify_login_otp(email, otp):
        """Validate login OTP and return JWT + user payload."""
        user = User.query.filter_by(email=email).first()
        if not user or user.login_otp != otp:
            raise PermissionError("Invalid OTP")
        if user.login_otp_expiry < datetime.datetime.utcnow():
            user.login_otp = None
            user.login_otp_expiry = None
            db.session.commit()
            raise PermissionError("OTP expired. Please login again.")

        user.login_otp = None
        user.login_otp_expiry = None
        db.session.commit()

        expires = datetime.timedelta(days=7)
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)

        return {
            "token": access_token,
            "role": user.role,
            "warehouse_id": user.warehouse_id,
            "user": user.to_dict(),
        }

    @staticmethod
    def request_reset_otp(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError("User not found")
        otp = AuthService._generate_otp()
        user.reset_otp = otp
        user.reset_otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        db.session.commit()
        payload = {"message": "OTP sent to your email"}
        payload.update(
            AuthService._send_or_return_otp(
                user.email,
                otp,
                "Your CoreInventory Password Reset Code",
                "password reset",
                "development_otp",
            )
        )
        return payload

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
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise ValueError("User not found")
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        return user.to_dict()

    @staticmethod
    def update_profile(user_id, data):
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise ValueError("User not found")
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        if "name" in data:
            user.name = data["name"]
        if "email" in data:
            user.email = data["email"]
        db.session.commit()
        return user.to_dict()
