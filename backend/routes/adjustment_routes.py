from flask import Blueprint, request, jsonify
from models.adjustment_model import Adjustment
from models.inventory_model import Inventory
from extensions.db import db

adjustment_bp = Blueprint("adjustments", __name__)


@adjustment_bp.route("/", methods=["POST"])
def adjust_inventory():

    data = request.json

    inventory = Inventory.query.filter_by(
        product_id=data["product_id"],
        warehouse_id=data["warehouse_id"]
    ).first()

    if not inventory:
        return jsonify({"error": "Inventory not found"}), 404

    adjustment = Adjustment(
        product_id=data["product_id"],
        warehouse_id=data["warehouse_id"],
        old_quantity=inventory.quantity,
        new_quantity=data["new_quantity"],
        reason=data["reason"]
    )

    inventory.quantity = data["new_quantity"]

    db.session.add(adjustment)
    db.session.commit()

    return jsonify({"message": "Inventory adjusted"})