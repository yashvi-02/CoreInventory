from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.delivery_service import DeliveryService
from utils.response import success_response, error_response
from utils.rbac import require_manager_or_staff_in_warehouse

delivery_bp = Blueprint("deliveries", __name__)

@delivery_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_deliveries():
    try:
        deliveries = DeliveryService.get_all()
        return success_response(deliveries, "Fetched all deliveries", 200)
    except Exception as e:
        return error_response(str(e), 500)


@delivery_bp.route("/<int:delivery_id>", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_delivery(delivery_id):
    try:
        delivery = DeliveryService.get_by_id(delivery_id)
        return success_response(delivery, "Fetched delivery", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@delivery_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_delivery():
    data = request.json
    try:
        delivery = DeliveryService.create(data)
        return success_response(delivery, "Delivery drafted successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)

@delivery_bp.route("/<int:delivery_id>/validate", methods=["POST"], strict_slashes=False)
@jwt_required()
def validate_delivery(delivery_id):
    warehouse_id = request.json.get("warehouse_id") if request.json else None
    if not warehouse_id:
        return error_response("warehouse_id is required to validate delivery", 400)
    try:
        warehouse_id = int(warehouse_id)
        if not require_manager_or_staff_in_warehouse(warehouse_id):
            return error_response("Access denied to this warehouse", 403)
        delivery = DeliveryService.validate(delivery_id, warehouse_id)
        return success_response(delivery, "Delivery validated successfully", 200)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)