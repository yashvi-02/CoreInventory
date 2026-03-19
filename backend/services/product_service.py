from models.product_model import Product
from models.category_model import Category
from models.inventory_model import Inventory
from models.ledger_model import StockLedger
from extensions.db import db
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

class ProductService:
    @staticmethod
    def _resolve_category_id(data, allow_create=True):
        category_id = data.get("category_id")
        category_name = (data.get("category_name") or data.get("category") or "").strip()

        if category_id:
            category = Category.query.get(category_id)
            if not category:
                raise ValueError("Selected category does not exist")
            return category.id

        if category_name:
            category = Category.query.filter(func.lower(Category.name) == category_name.lower()).first()
            if category:
                return category.id
            if allow_create:
                category = Category(name=category_name)
                db.session.add(category)
                db.session.flush()
                return category.id

        raise ValueError("category_id or category_name is required")

    @staticmethod
    def _serialize(product):
        quantity = (
            db.session.query(func.coalesce(func.sum(Inventory.quantity), 0))
            .filter(Inventory.product_id == product.id)
            .scalar()
        )
        payload = product.to_dict()
        payload["quantity"] = int(quantity or 0)
        payload["category_name"] = product.category.name if product.category else None
        return payload

    @staticmethod
    def get_all():
        products = Product.query.order_by(Product.created_at.desc(), Product.id.desc()).all()
        return [ProductService._serialize(p) for p in products]
    
    @staticmethod
    def get_by_id(product_id):
        product = Product.query.get(product_id)
        if not product:
            raise KeyError("Product not found")
        return ProductService._serialize(product)

    @staticmethod
    def create(data):
        required_fields = ["name", "sku"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        category_id = ProductService._resolve_category_id(data)

        product = Product(
            name=data["name"],
            sku=data["sku"],
            category_id=category_id,
            price=data.get("price"),
            unit=(data.get("unit") or "units").strip() or "units",
            reorder_level=data.get("reorder_level", 10),
        )

        try:
            db.session.add(product)
            db.session.flush()

            initial_quantity = int(data.get("initial_quantity") or 0)
            warehouse_id = data.get("warehouse_id")
            location = (data.get("location") or "").strip() or None

            if initial_quantity and warehouse_id:
                inventory = Inventory.query.filter_by(product_id=product.id, warehouse_id=warehouse_id, location=location).first()
                if inventory:
                    inventory.quantity += initial_quantity
                else:
                    inventory = Inventory(
                        product_id=product.id,
                        warehouse_id=warehouse_id,
                        location=location,
                        quantity=initial_quantity,
                    )
                    db.session.add(inventory)
                db.session.add(
                    StockLedger(
                        product_id=product.id,
                        warehouse_id=warehouse_id,
                        type="adjustment",
                        quantity=initial_quantity,
                        reference_id=product.id,
                    )
                )
            db.session.commit()
            return ProductService._serialize(product)
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
        if "category_id" in data or "category_name" in data:
            product.category_id = ProductService._resolve_category_id(data)
        if "price" in data:
            product.price = data["price"]
        if "unit" in data:
            product.unit = data["unit"]
        if "reorder_level" in data:
            product.reorder_level = data["reorder_level"]
            
        try:
            db.session.commit()
            return ProductService._serialize(product)
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
