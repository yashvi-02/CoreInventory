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
        required_fields = ["name", "sku", "category_id"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        product = Product(
            name=data["name"],
            sku=data["sku"],
            category_id=data["category_id"],
            price=data.get("price"),
            unit=data.get("unit", "units"),
            reorder_level=data.get("reorder_level", 10)
        )

        try:
            db.session.add(product)
            db.session.commit()
            return product.to_dict()
        except IntegrityError as e:
            db.session.rollback()
            if "unique constraint" in str(e).lower() or "unique" in str(e).lower():
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
        if "category_id" in data:
            product.category_id = data["category_id"]
        if "price" in data:
            product.price = data["price"]
        if "unit" in data:
            product.unit = data["unit"]
        if "reorder_level" in data:
            product.reorder_level = data["reorder_level"]
            
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
