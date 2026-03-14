from extensions.db import db

class Transfer(db.Model):
    __tablename__ = "transfers"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))

    from_location = db.Column(db.String(200))
    to_location = db.Column(db.String(200))

    quantity = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "from_location": self.from_location,
            "to_location": self.to_location,
            "quantity": self.quantity
        }