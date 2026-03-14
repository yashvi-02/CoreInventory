from flask import Blueprint
from flask_jwt_extended import jwt_required
from services.dashboard_service import DashboardService
from utils.response import success_response, error_response

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_dashboard():
    try:
        metrics = DashboardService.get_dashboard_metrics()
        return success_response(metrics, "Dashboard metrics fetched successfully", 200)
    except Exception as e:
        return error_response(str(e), 500)

@dashboard_bp.route("/alerts/low-stock", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_low_stock_alerts():
    try:
        alerts = DashboardService.get_low_stock_alerts()
        return success_response(alerts, "Low stock alerts fetched successfully", 200)
    except Exception as e:
        return error_response(str(e), 500)
