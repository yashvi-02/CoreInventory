from models.transfer_model import Transfer
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService

class TransferService:
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
        transfers = Transfer.query.all()
        return [t.to_dict() for t in transfers]

    @staticmethod
    def get_by_id(transfer_id):
        transfer = Transfer.query.get(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found")
        return transfer.to_dict()

    @staticmethod
    def create(data):
        if not data:
            raise ValueError("Missing from_warehouse_id, to_warehouse_id, or items")
        from_warehouse_id = data.get("from_warehouse_id", data.get("from_warehouse"))
        to_warehouse_id = data.get("to_warehouse_id", data.get("to_warehouse"))
        items = TransferService._normalize_items(data)
        if not from_warehouse_id or not to_warehouse_id or not items:
            raise ValueError("Missing from_warehouse_id, to_warehouse_id, or items")

        if from_warehouse_id == to_warehouse_id:
            raise ValueError("Source and destination warehouses cannot be the same")

        transfer = Transfer(
            from_warehouse_id=from_warehouse_id,
            to_warehouse_id=to_warehouse_id,
            status="done"
        )
        db.session.add(transfer)
        db.session.flush()

        from models.transfer_model import TransferItem
        total_quantity = 0
        for item in items:
            if item["quantity"] <= 0:
                raise ValueError(f"Quantity must be greater than zero for product {item.get('product_id')}")

            from_inv = Inventory.query.filter_by(
                product_id=item["product_id"],
                warehouse_id=from_warehouse_id
            ).first()
            if not from_inv or from_inv.quantity < item["quantity"]:
                raise ValueError(f"Insufficient stock for product {item['product_id']} in source warehouse")

            ti = TransferItem(
                transfer_id=transfer.id,
                product_id=item["product_id"],
                quantity=item["quantity"]
            )
            db.session.add(ti)
            total_quantity += item["quantity"]

            from_inv.quantity -= item["quantity"]
            to_inv = Inventory.query.filter_by(
                product_id=item["product_id"],
                warehouse_id=to_warehouse_id
            ).first()
            if to_inv:
                to_inv.quantity += item["quantity"]
            else:
                db.session.add(
                    Inventory(
                        product_id=item["product_id"],
                        warehouse_id=to_warehouse_id,
                        quantity=item["quantity"],
                        location=data.get("location", "") or ""
                    )
                )

            LedgerService.log_transaction(
                product_id=item["product_id"],
                warehouse_id=from_warehouse_id,
                operation_type="transfer",
                quantity_change=-item["quantity"],
                reference_id=transfer.id
            )
            LedgerService.log_transaction(
                product_id=item["product_id"],
                warehouse_id=to_warehouse_id,
                operation_type="transfer",
                quantity_change=item["quantity"],
                reference_id=transfer.id
            )

        db.session.commit()
        result = Transfer.query.get(transfer.id).to_dict()
        if len(items) == 1:
            result["product_id"] = items[0]["product_id"]
            result["quantity"] = items[0]["quantity"]
        else:
            result["quantity"] = total_quantity
        return result

    @staticmethod
    def validate(transfer_id):
        transfer = Transfer.query.get(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found")
        
        if transfer.status == "done":
            raise ValueError("Transfer is already validated")

        from models.inventory_model import Inventory
        # Check stock from source
        for item in transfer.items:
            from_inv = Inventory.query.filter_by(
                product_id=item.product_id,
                warehouse_id=transfer.from_warehouse_id
            ).first()

            if not from_inv or from_inv.quantity < item.quantity:
                raise ValueError(f"Insufficient stock for product {item.product_id} in source warehouse")

        transfer.status = "done"

        # Transfer stock and log
        for item in transfer.items:
            from_inv = Inventory.query.filter_by(
                product_id=item.product_id,
                warehouse_id=transfer.from_warehouse_id
            ).first()
            from_inv.quantity -= item.quantity

            to_inv = Inventory.query.filter_by(
                product_id=item.product_id,
                warehouse_id=transfer.to_warehouse_id
            ).first()

            if to_inv:
                to_inv.quantity += item.quantity
            else:
                to_inv = Inventory(
                    product_id=item.product_id,
                    warehouse_id=transfer.to_warehouse_id,
                    quantity=item.quantity,
                    location=""
                )
                db.session.add(to_inv)

            LedgerService.log_transaction(
                product_id=item.product_id,
                warehouse_id=transfer.from_warehouse_id,
                operation_type="transfer",
                quantity_change=-item.quantity,
                reference_id=transfer.id
            )
            
            LedgerService.log_transaction(
                product_id=item.product_id,
                warehouse_id=transfer.to_warehouse_id,
                operation_type="transfer",
                quantity_change=item.quantity,
                reference_id=transfer.id
            )

        db.session.commit()
        return transfer.to_dict()
