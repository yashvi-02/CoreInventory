from flask import Flask
from config import Config
from extensions.db import db
from flask_cors import CORS

# Import route blueprints
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.receipt_routes import receipt_bp
from routes.delivery_routes import delivery_bp
from routes.transfer_routes import transfer_bp
from routes.adjustment_routes import adjustment_bp
from routes.ledger_routes import ledger_bp


def create_app():
    app = Flask(__name__)

    # Load config
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Initialize database
    db.init_app(app)

    # Register routes
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

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)