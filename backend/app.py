from flask import Flask
from config import Config
from extensions.db import db
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy import text

# Import all models so SQLAlchemy registers the tables
from models import User, Product, Receipt, Delivery, Transfer, Adjustment, StockLedger, Inventory

from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.receipt_routes import receipt_bp
from routes.delivery_routes import delivery_bp
from routes.transfer_routes import transfer_bp
from routes.adjustment_routes import adjustment_bp
from routes.ledger_routes import ledger_bp

migrate = Migrate()


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
            print("[OK] Database tables created successfully!")
        except Exception as e:
            print(f"[WARNING] Database connection failed: {e}")
            print("   The app will start, but DB operations will fail until the connection is fixed.")

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
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