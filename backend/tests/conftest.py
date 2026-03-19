import os
import pytest
import werkzeug
from app import create_app
from extensions.db import db
from models.category_model import Category
from models.warehouse_model import Warehouse

if not hasattr(werkzeug, "__version__"):
    werkzeug.__version__ = "3"

@pytest.fixture
def app():
    # Setup test environment configurations
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-jwt-secret-for-pytest"
    })

    with app.app_context():
        db.create_all()
        if Warehouse.query.count() == 0:
            db.session.add_all([
                Warehouse(id=1, name="Main Warehouse", location="HQ"),
                Warehouse(id=2, name="Secondary Warehouse", location="Annex"),
            ])
            db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    # Register and login to mock a logged-in user and return their token
    register_response = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "role": "admin"
    })

    client.post("/api/auth/verify-email", json={
        "email": "test@example.com",
        "otp": register_response.json["data"]["development_otp"]
    })

    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    otp = response.json["data"]["development_otp"]
    verify_login = client.post("/api/auth/verify-login-otp", json={
        "email": "test@example.com",
        "otp": otp
    })
    return verify_login.json["data"]["token"]

@pytest.fixture
def category(app):
    with app.app_context():
        category = Category(name="Electronics")
        db.session.add(category)
        db.session.commit()
        return category.id

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
