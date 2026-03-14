from models.product_model import Product
from models.inventory_model import Inventory
from models.receipt_model import Receipt
from models.delivery_model import Delivery
from models.transfer_model import Transfer
from extensions.db import db
from sqlalchemy import func

class DashboardService:
    @staticmethod
    def get_dashboard_metrics():
        # Total products in stock
        total_products = db.session.query(func.sum(Inventory.quantity)).scalar() or 0
        
        # Low stock items and out of stock items
        low_stock = 0
        out_of_stock = 0
        
        products = Product.query.all()
        for product in products:
            qty = db.session.query(func.sum(Inventory.quantity)).filter(Inventory.product_id == product.id).scalar() or 0
            if qty == 0:
                out_of_stock += 1
            elif qty <= (product.reorder_level or 0):
                low_stock += 1
                
        # Pending receipts, deliveries, transfers
        pending_receipts = Receipt.query.filter(Receipt.status.in_(["draft", "waiting"])).count()
        pending_deliveries = Delivery.query.filter(Delivery.status.in_(["draft", "ready"])).count()
        internal_transfers = Transfer.query.filter_by(status="draft").count()
        
        return {
            "totalProducts": total_products,
            "lowStock": low_stock,
            "outOfStock": out_of_stock,
            "pendingReceipts": pending_receipts,
            "pendingDeliveries": pending_deliveries,
            "internalTransfers": internal_transfers
        }

    @staticmethod
    def get_low_stock_alerts():
        alerts = []
        products = Product.query.all()
        for product in products:
            qty = db.session.query(func.sum(Inventory.quantity)).filter(Inventory.product_id == product.id).scalar() or 0
            if qty <= (product.reorder_level or 0):
                alerts.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "quantity": qty,
                    "reorder_level": product.reorder_level,
                    "category_id": product.category_id
                })
        return alerts
