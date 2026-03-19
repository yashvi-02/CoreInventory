from flask import Blueprint, request
from models.warehouse_model import Warehouse
from services.warehouse_service import WarehouseService
from utils.response import success_response, error_response
from utils.rbac import filter_warehouses_for_user, get_current_user_context, require_manager
from flask_jwt_extended import jwt_required

warehouse_bp = Blueprint("warehouse", __name__)


@warehouse_bp.route("", methods=["GET"], strict_slashes=False)
def get_warehouses():
    try:
        query = Warehouse.query
        try:
            query = filter_warehouses_for_user(query)
        except Exception:
            pass  # No JWT or auth failed: return all (e.g. for register page)
        warehouses = query.all()
        return success_response([w.to_dict() for w in warehouses], "Warehouses fetched successfully", 200)
    except Exception as e:
        return error_response(str(e), 500)


@warehouse_bp.route("/<int:warehouse_id>", methods=["GET"], strict_slashes=False)
def get_warehouse(warehouse_id):
    try:
        warehouse = WarehouseService.get_warehouse_by_id(warehouse_id)
        try:
            from utils.rbac import get_accessible_warehouse_ids
            allowed = get_accessible_warehouse_ids()
            if allowed and warehouse_id not in allowed:
                return error_response("Access denied to this warehouse", 403)
        except Exception:
            pass
        return success_response(warehouse.to_dict(), "Warehouse fetched successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@warehouse_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
@require_manager
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
@require_manager
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
@require_manager
def delete_warehouse(warehouse_id):
    try:
        WarehouseService.delete_warehouse(warehouse_id)
        return success_response(None, "Warehouse deleted successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)
