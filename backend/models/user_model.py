from extensions.db import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default="user")  # manager, warehouse_staff, admin

    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=True)

    reset_otp = db.Column(db.String(10), nullable=True)
    reset_otp_expiry = db.Column(db.DateTime, nullable=True)

    login_otp = db.Column(db.String(10), nullable=True)
    login_otp_expiry = db.Column(db.DateTime, nullable=True)

    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_verification_otp = db.Column(db.String(10), nullable=True)
    email_verification_otp_expiry = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "warehouse_id": self.warehouse_id,
            "email_verified": self.email_verified,
        }
