class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:password@localhost:5432/inventory_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "supersecretkey"