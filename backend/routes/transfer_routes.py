from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.transfer_service import TransferService
from utils.response import success_response, error_response

transfer_bp = Blueprint("transfers", __name__)

@transfer_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_transfers():
    try:
        transfers = TransferService.get_all()
        return success_response(transfers, "Fetched all transfers", 200)
    except Exception as e:
        return error_response(str(e), 500)


@transfer_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_transfer():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        transfer = TransferService.create(data)
        return success_response(transfer, "Stock transferred successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)