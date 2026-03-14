from models.ledger_model import StockLedger
from extensions.db import db
from sqlalchemy.exc import IntegrityError

class LedgerService:
    @staticmethod
    def log_transaction(product_id, warehouse_id, operation_type, quantity_change, reference_id=None):
        ledger_entry = StockLedger(
            product_id=product_id,
            warehouse_id=warehouse_id,
            operation_type=operation_type,
            quantity_change=quantity_change,
            reference_id=reference_id
        )
        db.session.add(ledger_entry)
        # We don't commit here because it should be committed alongside the main transaction
        
    @staticmethod
    def get_all():
        entries = StockLedger.query.order_by(StockLedger.created_at.desc()).all()
        return [e.to_dict() for e in entries]

    @staticmethod
    def get_by_product(product_id):
        entries = StockLedger.query.filter_by(product_id=product_id).order_by(StockLedger.created_at.desc()).all()
        return [e.to_dict() for e in entries]
