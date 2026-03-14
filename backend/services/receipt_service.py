from models.receipt_model import Receipt
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService
from sqlalchemy.orm.exc import NoResultFound

class ReceiptService:
    @staticmethod
    def get_all():
        receipts = Receipt.query.all()
        return [r.to_dict() for r in receipts]

    @staticmethod
    def get_by_id(receipt_id):
        receipt = Receipt.query.get(receipt_id)
        if not receipt:
            raise ValueError("Receipt not found")
        return receipt.to_dict()

    @staticmethod
    def create(data):
        if not data or "supplier" not in data or "items" not in data:
            raise ValueError("Missing supplier or items")

        receipt = Receipt(supplier=data["supplier"], status="draft")
        db.session.add(receipt)
        db.session.flush()

        from models.receipt_model import ReceiptItem
        for item in data["items"]:
            if item["quantity"] <= 0:
                raise ValueError(f"Quantity must be greater than zero for product {item.get('product_id')}")
            ri = ReceiptItem(
                receipt_id=receipt.id,
                product_id=item["product_id"],
                quantity=item["quantity"]
            )
            db.session.add(ri)

        db.session.commit()
        return Receipt.query.get(receipt.id).to_dict()

    @staticmethod
    def validate(receipt_id, warehouse_id):
        receipt = Receipt.query.get(receipt_id)
        if not receipt:
            raise ValueError("Receipt not found")
        
        if receipt.status == "done":
            raise ValueError("Receipt is already validated")

        receipt.status = "done"

        from models.inventory_model import Inventory
        for item in receipt.items:
            inventory = Inventory.query.filter_by(
                product_id=item.product_id,
                warehouse_id=warehouse_id
            ).first()

            if inventory:
                inventory.quantity += item.quantity
            else:
                inventory = Inventory(
                    product_id=item.product_id,
                    warehouse_id=warehouse_id,
                    quantity=item.quantity,
                    location=""
                )
                db.session.add(inventory)

            LedgerService.log_transaction(
                product_id=item.product_id,
                warehouse_id=warehouse_id,
                operation_type="receipt",
                quantity_change=item.quantity,
                reference_id=receipt.id
            )

        db.session.commit()
        return receipt.to_dict()
