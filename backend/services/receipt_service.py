from models.receipt_model import Receipt
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService
from sqlalchemy.orm.exc import NoResultFound

class ReceiptService:
    @staticmethod
    def get_all():
        receipts = Receipt.query.all()
        return [{"id": r.id, "supplier": r.supplier, "created_at": r.created_at} for r in receipts]

    @staticmethod
    def create(data):
        required_fields = ["supplier", "product_id", "warehouse_id", "quantity"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        if data["quantity"] <= 0:
            raise ValueError("Quantity must be greater than zero")

        receipt = Receipt(
            supplier=data["supplier"],
            product_id=data["product_id"],
            quantity=data["quantity"]
        )
        db.session.add(receipt)
        db.session.flush() # get receipt ID

        inventory = Inventory.query.filter_by(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"]
        ).first()

        if inventory:
            inventory.quantity += data["quantity"]
        else:
            inventory = Inventory(
                product_id=data["product_id"],
                warehouse_id=data["warehouse_id"],
                quantity=data["quantity"]
            )
            db.session.add(inventory)

        LedgerService.log_transaction(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"],
            operation_type="RECEIPT",
            quantity_change=data["quantity"],
            reference_id=receipt.id
        )

        try:
            db.session.commit()
            return {"id": receipt.id, "supplier": receipt.supplier, "quantity": data["quantity"]}
        except Exception as e:
            db.session.rollback()
            raise Exception("Failed to create receipt")
