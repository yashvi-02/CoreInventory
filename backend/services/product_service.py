from models.product_model import Product
from extensions.db import db
from sqlalchemy.exc import IntegrityError

class ProductService:
    @staticmethod
    def get_all():
        products = Product.query.all()
        return [p.to_dict() for p in products]
    
    @staticmethod
    def get_by_id(product_id):
        product = Product.query.get(product_id)
        if not product:
            raise KeyError("Product not found")
        return product.to_dict()

    @staticmethod
    def create(data):
        required_fields = ["name", "sku", "category"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        product = Product(
            name=data["name"],
            sku=data["sku"],
            category=data["category"],
            price=data.get("price")
        )

        try:
            db.session.add(product)
            db.session.commit()
            return product.to_dict()
        except IntegrityError as e:
            db.session.rollback()
            if "unique constraint" in str(e).lower():
                raise FileExistsError(f"Product with SKU '{data['sku']}' already exists")
            raise Exception("Failed to create product")

    @staticmethod
    def update(product_id, data):
        product = Product.query.get(product_id)
        if not product:
            raise KeyError("Product not found")
        
        if "name" in data:
            product.name = data["name"]
        if "sku" in data:
            product.sku = data["sku"]
        if "category" in data:
            product.category = data["category"]
        if "price" in data:
            product.price = data["price"]
            
        try:
            db.session.commit()
            return product.to_dict()
        except IntegrityError as e:
            db.session.rollback()
            raise FileExistsError("Update failed: SKU may already exist")
            
    @staticmethod
    def delete(product_id):
        product = Product.query.get(product_id)
        if not product:
            raise KeyError("Product not found")
        
        db.session.delete(product)
        db.session.commit()
        return True
