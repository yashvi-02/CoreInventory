from flask import Blueprint, request, jsonify
from models.product_model import Product
from extensions.db import db

product_bp = Blueprint("products", __name__)


@product_bp.route("/", methods=["GET"])
def get_products():

    products = Product.query.all()

    result = []

    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category
        })

    return jsonify(result)


@product_bp.route("/", methods=["POST"])
def create_product():

    data = request.json

    product = Product(
        name=data["name"],
        sku=data["sku"],
        category=data["category"]
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"message": "Product created"})