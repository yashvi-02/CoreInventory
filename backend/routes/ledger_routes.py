from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.ledger_service import LedgerService
from utils.response import success_response, error_response
from utils.rbac import get_accessible_warehouse_ids

ledger_bp = Blueprint("ledger", __name__)


@ledger_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_ledger():
    try:
        filters = {
            "type": request.args.get("type"),
            "warehouse_id": request.args.get("warehouse_id"),
            "product_id": request.args.get("product_id")
        }
        filters = {k: v for k, v in filters.items() if v is not None}
        allowed = get_accessible_warehouse_ids()
        if allowed and len(allowed) == 1:
            filters["warehouse_id"] = allowed[0]
        if allowed and filters.get("warehouse_id") and int(filters["warehouse_id"]) not in allowed:
            return error_response("Access denied to this warehouse", 403)

        entries = LedgerService.get_all(filters)
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