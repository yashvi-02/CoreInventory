from extensions.db import db

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    quantity = db.Column(db.Integer, default=0)
    price = db.Column(db.Float)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"))
    unit = db.Column(db.String(50), default="units")
    reorder_level = db.Column(db.Integer, default=10)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    category = db.relationship("Category")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "quantity": self.quantity,
            "price": self.price,
            "category_id": self.category_id,
            "unit": self.unit,
            "reorder_level": self.reorder_level
        }