from extensions.db import db

class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.Integer, primary_key=True)
    supplier = db.Column(db.String(200))
    status = db.Column(db.String(50), default="draft") # draft, waiting, done

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    items = db.relationship("ReceiptItem", backref="receipt", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "supplier": self.supplier,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "items": [item.to_dict() for item in self.items]
        }

class ReceiptItem(db.Model):
    __tablename__ = "receipt_items"

    id = db.Column(db.Integer, primary_key=True)
    receipt_id = db.Column(db.Integer, db.ForeignKey("receipts.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "receipt_id": self.receipt_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "product": self.product.name if self.product else None
        }