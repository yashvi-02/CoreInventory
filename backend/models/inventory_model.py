from extensions.db import db

class Inventory(db.Model):
    __tablename__ = "inventory"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    quantity = db.Column(db.Integer, default=0)

    warehouse_id = db.Column(db.Integer, db.ForeignKey("warehouses.id"), nullable=False)
    location = db.Column(db.String(200)) # specific aisle/bin/etc

    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    product = db.relationship("Product")
    warehouse = db.relationship("Warehouse")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "warehouse_id": self.warehouse_id,
            "location": self.location,
            "quantity": self.quantity
        }