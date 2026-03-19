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
        result = AuthService.register(data)
        return success_response(result, "Registration successful. Verify your email to continue.", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except FileExistsError as e:
        return error_response(str(e), 409)
    except Exception as e:
        return error_response(str(e), 500)

@auth_bp.route("/verify-email", methods=["POST"], strict_slashes=False)
def verify_email():
    data = request.json
    if not data or "email" not in data or "otp" not in data:
        return error_response("Missing email or verification code", 400)

    try:
        result = AuthService.verify_email(data["email"], data["otp"])
        return success_response(result, "Email verified successfully", 200)
    except ValueError as e:
        return error_response(str(e), 400)

@auth_bp.route("/resend-verification", methods=["POST"], strict_slashes=False)
def resend_verification():
    data = request.json
    if not data or "email" not in data:
        return error_response("Missing email", 400)

    try:
        result = AuthService.resend_verification(data["email"])
        return success_response(result, "Verification code sent", 200)
    except ValueError as e:
        return error_response(str(e), 400)

@auth_bp.route("/login", methods=["POST"], strict_slashes=False)
def login():
    data = request.json
    if not data:
        return error_response("Missing JSON payload", 400)

    try:
        result = AuthService.login(data)
        return success_response(result, "OTP sent. Verify to complete login.", 200)
    except ValueError as e:
        return error_response(str(e), 400)
    except PermissionError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response("Failed to login", 500)


@auth_bp.route("/verify-login-otp", methods=["POST"], strict_slashes=False)
def verify_login_otp():
    data = request.json
    if not data or "email" not in data or "otp" not in data:
        return error_response("Missing email or OTP", 400)

    try:
        result = AuthService.verify_login_otp(data["email"], data["otp"])
        return success_response(result, "Login successful", 200)
    except PermissionError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response("Failed to verify OTP", 500)

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
