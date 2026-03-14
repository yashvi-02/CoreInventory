from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.adjustment_service import AdjustmentService
from utils.response import success_response, error_response

adjustment_bp = Blueprint("adjustments", __name__)

@adjustment_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_adjustments():
    try:
        adjustments = AdjustmentService.get_all()
        return success_response(adjustments, "Fetched all adjustments", 200)
    except Exception as e:
        return error_response(str(e), 500)


@adjustment_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def adjust_inventory():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        adjustment = AdjustmentService.create(data)
        return success_response(adjustment, "Inventory adjusted successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except KeyError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)