from models.transfer_model import Transfer
from models.inventory_model import Inventory
from extensions.db import db
from services.ledger_service import LedgerService

class TransferService:
    @staticmethod
    def get_all():
        transfers = Transfer.query.all()
        return [{"id": t.id, "product_id": t.product_id, "from_warehouse": t.from_warehouse, "to_warehouse": t.to_warehouse, "quantity": t.quantity, "created_at": t.created_at} for t in transfers]

    @staticmethod
    def create(data):
        required_fields = ["product_id", "from_warehouse", "to_warehouse", "quantity"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        if data["quantity"] <= 0:
            raise ValueError("Quantity must be greater than zero")
            
        if data["from_warehouse"] == data["to_warehouse"]:
            raise ValueError("Source and destination warehouses cannot be the same")

        from_inventory = Inventory.query.filter_by(
            product_id=data["product_id"],
            warehouse_id=data["from_warehouse"]
        ).first()

        if not from_inventory or from_inventory.quantity < data["quantity"]:
            raise ValueError("Insufficient stock in the source warehouse")

        from_inventory.quantity -= data["quantity"]

        to_inventory = Inventory.query.filter_by(
            product_id=data["product_id"],
            warehouse_id=data["to_warehouse"]
        ).first()

        if to_inventory:
            to_inventory.quantity += data["quantity"]
        else:
            to_inventory = Inventory(
                product_id=data["product_id"],
                warehouse_id=data["to_warehouse"],
                quantity=data["quantity"]
            )
            db.session.add(to_inventory)

        transfer = Transfer(
            product_id=data["product_id"],
            from_warehouse=data["from_warehouse"],
            to_warehouse=data["to_warehouse"],
            quantity=data["quantity"]
        )
        db.session.add(transfer)
        db.session.flush()

        # Log ledger for source warehouse
        LedgerService.log_transaction(
            product_id=data["product_id"],
            warehouse_id=data["from_warehouse"],
            operation_type="TRANSFER_OUT",
            quantity_change=-data["quantity"],
            reference_id=transfer.id
        )
        
        # Log ledger for destination warehouse
        LedgerService.log_transaction(
            product_id=data["product_id"],
            warehouse_id=data["to_warehouse"],
            operation_type="TRANSFER_IN",
            quantity_change=data["quantity"],
            reference_id=transfer.id
        )

        try:
            db.session.commit()
            return {"id": transfer.id, "quantity_transferred": data["quantity"]}
        except Exception as e:
            db.session.rollback()
            raise Exception("Failed to transfer stock")
