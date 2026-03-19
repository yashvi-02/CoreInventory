from models.ledger_model import StockLedger
from extensions.db import db
from sqlalchemy.exc import IntegrityError

class LedgerService:
    @staticmethod
    def log_transaction(product_id, warehouse_id, operation_type, quantity_change, reference_id=None):
        ledger_entry = StockLedger(
            product_id=product_id,
            warehouse_id=warehouse_id,
            type=operation_type,
            quantity=quantity_change,
            reference_id=reference_id
        )
        db.session.add(ledger_entry)
        
    @staticmethod
    def get_all(filters=None):
        query = StockLedger.query
        
        if filters:
            if filters.get("type"):
                query = query.filter_by(type=filters["type"])
            if filters.get("warehouse_id"):
                query = query.filter_by(warehouse_id=filters["warehouse_id"])
            if filters.get("product_id"):
                query = query.filter_by(product_id=filters["product_id"])

        entries = query.order_by(StockLedger.created_at.desc()).all()
        result = []
        for entry in entries:
            item = entry.to_dict()
            item["change"] = item["quantity"]
            result.append(item)
        return result

    @staticmethod
    def get_by_product(product_id):
        return LedgerService.get_all({"product_id": product_id})
