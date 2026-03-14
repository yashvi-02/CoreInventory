from extensions.db import db

class Adjustment(db.Model):
    __tablename__ = "adjustments"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))
    warehouse_id = db.Column(db.Integer)

    old_quantity = db.Column(db.Integer)
    new_quantity = db.Column(db.Integer)

    reason = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "warehouse_id": self.warehouse_id,
            "old_quantity": self.old_quantity,
            "new_quantity": self.new_quantity,
            "reason": self.reason
        }