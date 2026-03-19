from models.receipt_model import Receipt
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService
from sqlalchemy.orm.exc import NoResultFound

class ReceiptService:
    @staticmethod
    def _normalize_items(data):
        if data.get("items"):
            return data["items"]
        if all(key in data for key in ("product_id", "quantity")):
            return [{
                "product_id": data["product_id"],
                "quantity": data["quantity"],
            }]
        return None

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
        if not data:
            raise ValueError("Missing required field: supplier")
        if "supplier" not in data:
            raise ValueError("Missing required field: supplier")
        items = ReceiptService._normalize_items(data)
        if not items:
            raise ValueError("Missing required field: product_id")

        warehouse_id = data.get("warehouse_id")
        receipt = Receipt(supplier=data["supplier"], status="done" if warehouse_id else "draft")
        db.session.add(receipt)
        db.session.flush()

        from models.receipt_model import ReceiptItem
        total_quantity = 0
        for item in items:
            if item["quantity"] <= 0:
                raise ValueError(f"Quantity must be greater than zero for product {item.get('product_id')}")
            ri = ReceiptItem(
                receipt_id=receipt.id,
                product_id=item["product_id"],
                quantity=item["quantity"]
            )
            db.session.add(ri)
            total_quantity += item["quantity"]

            if warehouse_id:
                inventory = Inventory.query.filter_by(
                    product_id=item["product_id"],
                    warehouse_id=warehouse_id
                ).first()
                if inventory:
                    inventory.quantity += item["quantity"]
                else:
                    inventory = Inventory(
                        product_id=item["product_id"],
                        warehouse_id=warehouse_id,
                        quantity=item["quantity"],
                        location=data.get("location", "") or ""
                    )
                    db.session.add(inventory)
                LedgerService.log_transaction(
                    product_id=item["product_id"],
                    warehouse_id=warehouse_id,
                    operation_type="receipt",
                    quantity_change=item["quantity"],
                    reference_id=receipt.id
                )

        db.session.commit()
        result = Receipt.query.get(receipt.id).to_dict()
        if len(items) == 1:
            result["product_id"] = items[0]["product_id"]
            result["quantity"] = items[0]["quantity"]
            result["warehouse_id"] = warehouse_id
        else:
            result["quantity"] = total_quantity
            result["warehouse_id"] = warehouse_id
        return result

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
