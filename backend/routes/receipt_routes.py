from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.receipt_service import ReceiptService
from utils.response import success_response, error_response

receipt_bp = Blueprint("receipts", __name__)

@receipt_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_receipts():
    try:
        receipts = ReceiptService.get_all()
        return success_response(receipts, "Fetched all receipts", 200)
    except Exception as e:
        return error_response(str(e), 500)

@receipt_bp.route("/<int:receipt_id>", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_receipt(receipt_id):
    try:
        receipt = ReceiptService.get_by_id(receipt_id)
        return success_response(receipt, "Fetched receipt", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@receipt_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_receipt():
    data = request.json
    try:
        receipt = ReceiptService.create(data)
        return success_response(receipt, "Receipt drafted successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)

@receipt_bp.route("/<int:receipt_id>/validate", methods=["POST"], strict_slashes=False)
@jwt_required()
def validate_receipt(receipt_id):
    warehouse_id = request.json.get("warehouse_id") if request.json else None
    if not warehouse_id:
        return error_response("warehouse_id is required to validate receipt", 400)
    try:
        receipt = ReceiptService.validate(receipt_id, warehouse_id)
        return success_response(receipt, "Receipt validated successfully", 200)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)