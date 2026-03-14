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

@receipt_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_receipt():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        receipt = ReceiptService.create(data)
        return success_response(receipt, "Stock received successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)