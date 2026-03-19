from flask import Flask
from config import Config
from extensions.db import db
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy import inspect, text
from models.category_model import Category
from models.warehouse_model import Warehouse

# Import all models so SQLAlchemy registers the tables
from models import User, Category, Warehouse, Product, Receipt, Delivery, Transfer, Adjustment, StockLedger, Inventory

from routes.auth_routes import auth_bp
from routes.category_routes import category_bp
from routes.warehouse_routes import warehouse_bp
from routes.dashboard_routes import dashboard_bp
from routes.product_routes import product_bp
from routes.receipt_routes import receipt_bp
from routes.delivery_routes import delivery_bp
from routes.transfer_routes import transfer_bp
from routes.adjustment_routes import adjustment_bp
from routes.ledger_routes import ledger_bp

migrate = Migrate()


def ensure_schema_updates():
    inspector = inspect(db.engine)
    existing_tables = set(inspector.get_table_names())
    if "users" not in existing_tables:
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    column_updates = [
        ("email_verified", "ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT 0"),
        ("email_verification_otp", "ALTER TABLE users ADD COLUMN email_verification_otp VARCHAR(10)"),
        ("email_verification_otp_expiry", "ALTER TABLE users ADD COLUMN email_verification_otp_expiry DATETIME"),
    ]

    for column_name, statement in column_updates:
        if column_name not in user_columns:
            db.session.execute(text(statement))

    db.session.commit()


def bootstrap_reference_data():
    if Warehouse.query.count() == 0:
        db.session.add_all([
            Warehouse(name="Main Warehouse", location="Head Office"),
            Warehouse(name="Secondary Warehouse", location="Operations Block"),
        ])

    if Category.query.count() == 0:
        db.session.add_all([
            Category(name="Electronics"),
            Category(name="Raw Materials"),
            Category(name="Finished Goods"),
        ])

    db.session.commit()


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    from extensions.jwt import jwt
    jwt.init_app(app)

    # Create all tables if they don't exist
    with app.app_context():
        try:
            db.create_all()
            ensure_schema_updates()
            bootstrap_reference_data()
            print("[OK] Database tables created successfully!")
        except Exception as e:
            print(f"[WARNING] Database connection failed: {e}")
            print("   The app will start, but DB operations will fail until the connection is fixed.")

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(category_bp, url_prefix="/api/categories")
    app.register_blueprint(warehouse_bp, url_prefix="/api/warehouses")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(product_bp, url_prefix="/api/products")
    app.register_blueprint(receipt_bp, url_prefix="/api/receipts")
    app.register_blueprint(delivery_bp, url_prefix="/api/deliveries")
    app.register_blueprint(transfer_bp, url_prefix="/api/transfers")
    app.register_blueprint(adjustment_bp, url_prefix="/api/adjustments")
    app.register_blueprint(ledger_bp, url_prefix="/api/ledger")

    @app.route("/")
    def home():
        return {"message": "CoreInventory Backend Running"}

    # DATABASE TEST ROUTE
    @app.route("/db-test")
    def db_test():
        try:
            db.session.execute(text("SELECT 1"))
            return {"status": "Database connected successfully"}
        except Exception as e:
            return {"error": str(e)}, 500

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {"status": "fail", "message": "Bad Request", "data": {}}, 400

    @app.errorhandler(401)
    def unauthorized(error):
        return {"status": "fail", "message": "Unauthorized", "data": {}}, 401

    @app.errorhandler(404)
    def not_found(error):
        return {"status": "fail", "message": "Resource not found", "data": {}}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"status": "error", "message": "Internal Server Error", "data": {}}, 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
