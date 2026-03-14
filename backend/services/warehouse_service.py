from models.warehouse_model import Warehouse
from extensions.db import db

class WarehouseService:
    @staticmethod
    def create_warehouse(data):
        if not data or "name" not in data:
            raise ValueError("Warehouse name is required")
        
        warehouse = Warehouse(
            name=data["name"],
            location=data.get("location", "")
        )
        db.session.add(warehouse)
        db.session.commit()
        return warehouse

    @staticmethod
    def get_all_warehouses():
        return Warehouse.query.all()

    @staticmethod
    def get_warehouse_by_id(warehouse_id):
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")
        return warehouse

    @staticmethod
    def update_warehouse(warehouse_id, data):
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")
        
        if "name" in data:
            warehouse.name = data["name"]
        if "location" in data:
            warehouse.location = data["location"]
            
        db.session.commit()
        return warehouse

    @staticmethod
    def delete_warehouse(warehouse_id):
        warehouse = Warehouse.query.get(warehouse_id)
        if not warehouse:
            raise ValueError("Warehouse not found")
        
        db.session.delete(warehouse)
        db.session.commit()
        return True
