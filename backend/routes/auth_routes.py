from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from utils.response import success_response, error_response

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"], strict_slashes=False)
def register():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)
        
    try:
        user = AuthService.register(data)
        return success_response({"id": user.id}, "User registered successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except FileExistsError as e:
        return error_response(str(e), 409)
    except Exception as e:
        return error_response(str(e), 500)

@auth_bp.route("/login", methods=["POST"], strict_slashes=False)
def login():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        result = AuthService.login(data)
        return success_response(result, "Login successful", 200)
    except ValueError as e:
        return error_response(str(e), 400)
    except PermissionError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response("Failed to login", 500)