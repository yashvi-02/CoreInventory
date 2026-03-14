from flask import Blueprint, request
from services.warehouse_service import WarehouseService
from utils.response import success_response, error_response
from flask_jwt_extended import jwt_required

warehouse_bp = Blueprint("warehouse", __name__)

@warehouse_bp.route("", methods=["GET"], strict_slashes=False)
def get_warehouses():
    try:
        warehouses = WarehouseService.get_all_warehouses()
        return success_response([w.to_dict() for w in warehouses], "Warehouses fetched successfully", 200)
    except Exception as e:
        return error_response(str(e), 500)

@warehouse_bp.route("/<int:warehouse_id>", methods=["GET"], strict_slashes=False)
def get_warehouse(warehouse_id):
    try:
        warehouse = WarehouseService.get_warehouse_by_id(warehouse_id)
        return success_response(warehouse.to_dict(), "Warehouse fetched successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@warehouse_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_warehouse():
    data = request.json
    try:
        warehouse = WarehouseService.create_warehouse(data)
        return success_response(warehouse.to_dict(), "Warehouse created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)

@warehouse_bp.route("/<int:warehouse_id>", methods=["PUT"], strict_slashes=False)
@jwt_required()
def update_warehouse(warehouse_id):
    data = request.json
    try:
        warehouse = WarehouseService.update_warehouse(warehouse_id, data)
        return success_response(warehouse.to_dict(), "Warehouse updated successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@warehouse_bp.route("/<int:warehouse_id>", methods=["DELETE"], strict_slashes=False)
@jwt_required()
def delete_warehouse(warehouse_id):
    try:
        WarehouseService.delete_warehouse(warehouse_id)
        return success_response(None, "Warehouse deleted successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)
