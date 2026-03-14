from flask import Blueprint
from flask_jwt_extended import jwt_required
from services.ledger_service import LedgerService
from utils.response import success_response, error_response

ledger_bp = Blueprint("ledger", __name__)

@ledger_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_ledger():
    try:
        entries = LedgerService.get_all()
        return success_response(entries, "Fetched ledger successfully")
    except Exception as e:
        return error_response(str(e), 500)

@ledger_bp.route("/product/<int:product_id>", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_ledger_by_product(product_id):
    try:
        entries = LedgerService.get_by_product(product_id)
        return success_response(entries, f"Fetched ledger for product {product_id}")
    except Exception as e:
        return error_response(str(e), 500)