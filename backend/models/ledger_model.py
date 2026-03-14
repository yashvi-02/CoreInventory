from extensions.db import db

class StockLedger(db.Model):
    __tablename__ = "stock_ledger"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    transaction_type = db.Column(db.String(50))
    quantity = db.Column(db.Integer)

    reference_id = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "transaction_type": self.transaction_type,
            "quantity": self.quantity,
            "reference_id": self.reference_id,
        }