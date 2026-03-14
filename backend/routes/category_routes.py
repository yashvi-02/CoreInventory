from flask import Blueprint, request
from services.category_service import CategoryService
from utils.response import success_response, error_response
from flask_jwt_extended import jwt_required

category_bp = Blueprint("category", __name__)

@category_bp.route("", methods=["GET"], strict_slashes=False)
def get_categories():
    try:
        categories = CategoryService.get_all_categories()
        return success_response([c.to_dict() for c in categories], "Categories fetched successfully", 200)
    except Exception as e:
        return error_response(str(e), 500)

@category_bp.route("/<int:category_id>", methods=["GET"], strict_slashes=False)
def get_category(category_id):
    try:
        category = CategoryService.get_category_by_id(category_id)
        return success_response(category.to_dict(), "Category fetched successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@category_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_category():
    data = request.json
    try:
        category = CategoryService.create_category(data)
        return success_response(category.to_dict(), "Category created successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)

@category_bp.route("/<int:category_id>", methods=["PUT"], strict_slashes=False)
@jwt_required()
def update_category(category_id):
    data = request.json
    try:
        category = CategoryService.update_category(category_id, data)
        return success_response(category.to_dict(), "Category updated successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)

@category_bp.route("/<int:category_id>", methods=["DELETE"], strict_slashes=False)
@jwt_required()
def delete_category(category_id):
    try:
        CategoryService.delete_category(category_id)
        return success_response(None, "Category deleted successfully", 200)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)
