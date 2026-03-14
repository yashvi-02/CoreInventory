from models.category_model import Category
from extensions.db import db

class CategoryService:
    @staticmethod
    def create_category(data):
        if not data or "name" not in data:
            raise ValueError("Category name is required")
        
        category = Category(name=data["name"])
        db.session.add(category)
        db.session.commit()
        return category

    @staticmethod
    def get_all_categories():
        return Category.query.all()

    @staticmethod
    def get_category_by_id(category_id):
        category = Category.query.get(category_id)
        if not category:
            raise ValueError("Category not found")
        return category

    @staticmethod
    def update_category(category_id, data):
        category = Category.query.get(category_id)
        if not category:
            raise ValueError("Category not found")
        
        if "name" in data:
            category.name = data["name"]
        
        db.session.commit()
        return category

    @staticmethod
    def delete_category(category_id):
        category = Category.query.get(category_id)
        if not category:
            raise ValueError("Category not found")
        
        db.session.delete(category)
        db.session.commit()
        return True
