from extensions.db import db

class Adjustment(db.Model):
    __tablename__ = "adjustments"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))

    adjustment_type = db.Column(db.String(50))
    quantity = db.Column(db.Integer)

    reason = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "adjustment_type": self.adjustment_type,
            "quantity": self.quantity,
            "reason": self.reason
        }