from flask import Blueprint, request, jsonify
from models.receipt_model import Receipt
from models.inventory_model import Inventory
from extensions.db import db

receipt_bp = Blueprint("receipts", __name__)


@receipt_bp.route("/", methods=["POST"])
def create_receipt():

    data = request.json

    receipt = Receipt(
        supplier=data["supplier"]
    )

    db.session.add(receipt)

    inventory = Inventory.query.filter_by(
        product_id=data["product_id"],
        warehouse_id=data["warehouse_id"]
    ).first()

    if inventory:
        inventory.quantity += data["quantity"]
    else:
        inventory = Inventory(
            product_id=data["product_id"],
            warehouse_id=data["warehouse_id"],
            quantity=data["quantity"]
        )
        db.session.add(inventory)

    db.session.commit()

    return jsonify({"message": "Stock received"})