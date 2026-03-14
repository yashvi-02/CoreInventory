from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.delivery_service import DeliveryService
from utils.response import success_response, error_response

delivery_bp = Blueprint("deliveries", __name__)

@delivery_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_deliveries():
    try:
        deliveries = DeliveryService.get_all()
        return success_response(deliveries, "Fetched all deliveries", 200)
    except Exception as e:
        return error_response(str(e), 500)


@delivery_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_delivery():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        delivery = DeliveryService.create(data)
        return success_response(delivery, "Delivery created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)