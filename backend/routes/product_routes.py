from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.product_service import ProductService
from utils.response import success_response, error_response

product_bp = Blueprint("products", __name__)

@product_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_products():
    try:
        products = ProductService.get_all()
        return success_response(products, "Fetched all products", 200)
    except Exception as e:
        return error_response(str(e), 500)

@product_bp.route("/<int:product_id>", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_product(product_id):
    try:
        product = ProductService.get_by_id(product_id)
        return success_response(product, "Product fetched successfully", 200)
    except KeyError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@product_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_product():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        product = ProductService.create(data)
        return success_response(product, "Product created", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except FileExistsError as e:
        return error_response(str(e), 409)
    except Exception as e:
        return error_response(str(e), 500)

@product_bp.route("/<int:product_id>", methods=["PUT"], strict_slashes=False)
@jwt_required()
def update_product(product_id):
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)
        
    try:
        product = ProductService.update(product_id, data)
        return success_response(product, "Product updated", 200)
    except KeyError as e:
        return error_response(str(e), 404)
    except FileExistsError as e:
        return error_response(str(e), 409)
    except Exception as e:
        return error_response(str(e), 500)

@product_bp.route("/<int:product_id>", methods=["DELETE"], strict_slashes=False)
@jwt_required()
def delete_product(product_id):
    try:
        ProductService.delete(product_id)
        return success_response(None, "Product deleted", 200)
    except KeyError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)