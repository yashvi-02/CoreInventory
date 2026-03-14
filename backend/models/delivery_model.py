from extensions.db import db

class Delivery(db.Model):
    __tablename__ = "deliveries"

    id = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String(200))
    status = db.Column(db.String(50), default="draft") # draft, ready, done

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    items = db.relationship("DeliveryItem", backref="delivery", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "customer": self.customer,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "items": [item.to_dict() for item in self.items]
        }

class DeliveryItem(db.Model):
    __tablename__ = "delivery_items"

    id = db.Column(db.Integer, primary_key=True)
    delivery_id = db.Column(db.Integer, db.ForeignKey("deliveries.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "delivery_id": self.delivery_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "product": self.product.name if self.product else None
        }