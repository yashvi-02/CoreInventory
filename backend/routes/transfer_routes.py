from flask import Blueprint, request, jsonify
from models.transfer_model import Transfer
from models.inventory_model import Inventory
from extensions.db import db

transfer_bp = Blueprint("transfers", __name__)


@transfer_bp.route("/", methods=["POST"])
def transfer_stock():

    data = request.json

    from_inventory = Inventory.query.filter_by(
        product_id=data["product_id"],
        warehouse_id=data["from_warehouse"]
    ).first()

    if not from_inventory or from_inventory.quantity < data["quantity"]:
        return jsonify({"error": "Insufficient stock"}), 400

    from_inventory.quantity -= data["quantity"]

    to_inventory = Inventory.query.filter_by(
        product_id=data["product_id"],
        warehouse_id=data["to_warehouse"]
    ).first()

    if to_inventory:
        to_inventory.quantity += data["quantity"]
    else:
        to_inventory = Inventory(
            product_id=data["product_id"],
            warehouse_id=data["to_warehouse"],
            quantity=data["quantity"]
        )
        db.session.add(to_inventory)

    transfer = Transfer(
        product_id=data["product_id"],
        from_warehouse=data["from_warehouse"],
        to_warehouse=data["to_warehouse"],
        quantity=data["quantity"]
    )

    db.session.add(transfer)

    db.session.commit()

    return jsonify({"message": "Transfer successful"})