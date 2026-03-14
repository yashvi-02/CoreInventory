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

@auth_bp.route("/request-reset-otp", methods=["POST"], strict_slashes=False)
def request_reset_otp():
    try:
        return success_response(AuthService.request_reset_otp(request.json.get("email")), "OTP generated", 200)
    except ValueError as e:
        return error_response(str(e), 400)

@auth_bp.route("/verify-otp", methods=["POST"], strict_slashes=False)
def verify_otp():
    try:
        return success_response(AuthService.verify_otp(request.json.get("email"), request.json.get("otp")), "Verified", 200)
    except ValueError as e:
        return error_response(str(e), 400)

@auth_bp.route("/reset-password", methods=["POST"], strict_slashes=False)
def reset_password():
    try:
        return success_response(AuthService.reset_password(request.json.get("email"), request.json.get("otp"), request.json.get("new_password")), "Password reset", 200)
    except ValueError as e:
        return error_response(str(e), 400)

@auth_bp.route("/logout", methods=["POST"], strict_slashes=False)
def logout():
    # Stateless JWT. Can just return success.
    return success_response(None, "Logged out", 200)

from flask_jwt_extended import jwt_required, get_jwt_identity

@auth_bp.route("/profile", methods=["GET", "PUT"], strict_slashes=False)
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    try:
        if request.method == "GET":
            return success_response(AuthService.get_profile(user_id), "Profile fetched", 200)
        else:
            return success_response(AuthService.update_profile(user_id, request.json), "Profile updated", 200)
    except ValueError as e:
        return error_response(str(e), 400)