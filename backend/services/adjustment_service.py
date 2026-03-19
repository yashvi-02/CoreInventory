from models.adjustment_model import Adjustment
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService

class AdjustmentService:
    @staticmethod
    def get_all():
        adjustments = Adjustment.query.all()
        return [{"id": a.id, "product_id": a.product_id, "warehouse_id": a.warehouse_id, "old_quantity": a.previous_quantity, "new_quantity": a.new_quantity, "reason": a.reason, "created_at": a.created_at} for a in adjustments]

    @staticmethod
    def create(data):
        required_fields = ["product_id", "warehouse_id", "new_quantity", "reason"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        if data["new_quantity"] < 0:
            raise ValueError("New quantity cannot be negative")

        inventory = Inventory.query.filter_by(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"]
        ).first()

        if not inventory:
            raise KeyError("Inventory record not found")

        old_qty = inventory.quantity
        inventory.quantity = data["new_quantity"]

        adjustment = Adjustment(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"],
            previous_quantity=old_qty,
            new_quantity=data["new_quantity"],
            reason=data["reason"]
        )
        db.session.add(adjustment)
        db.session.flush()

        # Log ledger
        qty_change = data["new_quantity"] - old_qty
        LedgerService.log_transaction(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"],
            operation_type="adjustment",
            quantity_change=qty_change,
            reference_id=adjustment.id
        )

        try:
            db.session.commit()
            return {"id": adjustment.id, "adjusted_quantity": data["new_quantity"]}
        except Exception as e:
            db.session.rollback()
            raise Exception("Failed to adjust inventory")
