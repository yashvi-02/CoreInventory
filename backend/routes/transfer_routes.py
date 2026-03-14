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


@transfer_bp.route("/<int:transfer_id>", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_transfer(transfer_id):
    try:
        transfer = TransferService.get_by_id(transfer_id)
        return success_response(transfer, "Fetched transfer", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@transfer_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_transfer():
    data = request.json
    try:
        transfer = TransferService.create(data)
        return success_response(transfer, "Transfer drafted successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)

@transfer_bp.route("/<int:transfer_id>/validate", methods=["POST"], strict_slashes=False)
@jwt_required()
def validate_transfer(transfer_id):
    try:
        transfer = TransferService.validate(transfer_id)
        return success_response(transfer, "Transfer validated successfully", 200)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)