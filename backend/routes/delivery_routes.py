from flask import Blueprint, request, jsonify
from models.delivery_model import Delivery
from models.inventory_model import Inventory
from extensions.db import db

delivery_bp = Blueprint("deliveries", __name__)


@delivery_bp.route("/", methods=["POST"])
def create_delivery():

    data = request.json

    delivery = Delivery(
        customer=data["customer"]
    )

    db.session.add(delivery)

    inventory = Inventory.query.filter_by(
        product_id=data["product_id"],
        warehouse_id=data["warehouse_id"]
    ).first()

    if not inventory or inventory.quantity < data["quantity"]:
        return jsonify({"error": "Not enough stock"}), 400

    inventory.quantity -= data["quantity"]

    db.session.commit()

    return jsonify({"message": "Delivery created"})