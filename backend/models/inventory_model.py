from extensions.db import db

class Inventory(db.Model):
    __tablename__ = "inventory"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    quantity = db.Column(db.Integer, default=0)

    location = db.Column(db.String(100), default="Main Warehouse")

    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "location": self.location
        }