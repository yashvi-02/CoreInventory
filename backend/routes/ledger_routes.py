from flask import Blueprint, jsonify
from models.ledger_model import StockLedger

ledger_bp = Blueprint("ledger", __name__)


@ledger_bp.route("/", methods=["GET"])
def get_ledger():

    entries = StockLedger.query.all()

    result = []

    for e in entries:
        result.append({
            "product_id": e.product_id,
            "warehouse_id": e.warehouse_id,
            "operation": e.operation_type,
            "change": e.quantity_change,
            "date": e.created_at
        })

    return jsonify(result)