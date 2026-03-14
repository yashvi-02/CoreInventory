import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), 'coreinventory.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False