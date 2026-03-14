from models.delivery_model import Delivery
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService

class DeliveryService:
    @staticmethod
    def get_all():
        deliveries = Delivery.query.all()
        return [{"id": d.id, "customer": d.customer, "created_at": d.created_at} for d in deliveries]

    @staticmethod
    def create(data):
        required_fields = ["customer", "product_id", "warehouse_id", "quantity"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        if data["quantity"] <= 0:
            raise ValueError("Quantity must be greater than zero")

        inventory = Inventory.query.filter_by(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"]
        ).first()

        if not inventory or inventory.quantity < data["quantity"]:
            raise ValueError("Not enough stock in the specified warehouse")

        delivery = Delivery(
            customer=data["customer"],
            product_id=data["product_id"],
            quantity=data["quantity"]
        )
        db.session.add(delivery)
        db.session.flush()

        inventory.quantity -= data["quantity"]
        
        LedgerService.log_transaction(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"],
            operation_type="DELIVERY",
            quantity_change=-data["quantity"], # Negative change for delivery
            reference_id=delivery.id
        )

        try:
            db.session.commit()
            return {"id": delivery.id, "customer": delivery.customer, "quantity": data["quantity"]}
        except Exception as e:
            db.session.rollback()
            raise Exception("Failed to create delivery record")
