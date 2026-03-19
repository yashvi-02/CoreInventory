"""Role-based access control: manager (all warehouses) vs warehouse_staff (single warehouse)."""
from functools import wraps
from flask import request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models.user_model import User
from models.warehouse_model import Warehouse


def get_current_user_context():
    """Get user_id, role, warehouse_id from JWT. Requires valid JWT."""
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return None
    return {
        "user_id": user.id,
        "role": user.role,
        "warehouse_id": user.warehouse_id,
        "user": user,
    }


def is_manager(role):
    return role in ("manager", "admin")


def require_manager(f):
    """Decorator: only managers (and admin) can access."""
    @wraps(f)
    def decorated(*args, **kwargs):
        ctx = get_current_user_context()
        if not ctx or not is_manager(ctx["role"]):
            from utils.response import error_response
            return error_response("Manager access required", 403)
        return f(*args, **kwargs)
    return decorated


def require_manager_or_staff_in_warehouse(warehouse_id):
    """Check: manager always allowed; staff only if warehouse_id matches their assignment."""
    ctx = get_current_user_context()
    if not ctx:
        return False
    if is_manager(ctx["role"]):
        return True
    if ctx["role"] == "warehouse_staff" and ctx["warehouse_id"] == warehouse_id:
        return True
    return False


def filter_warehouses_for_user(query):
    """For staff, filter to only their warehouse. Managers see all."""
    ctx = get_current_user_context()
    if not ctx:
        return query.filter(False)
    if is_manager(ctx["role"]):
        return query
    if ctx["role"] == "warehouse_staff" and ctx["warehouse_id"]:
        return query.filter(Warehouse.id == ctx["warehouse_id"])
    return query


def get_accessible_warehouse_ids():
    """Return list of warehouse IDs the current user can access. Empty if no auth."""
    try:
        ctx = get_current_user_context()
    except Exception:
        return []
    if not ctx:
        return []
    if is_manager(ctx["role"]):
        return [w.id for w in Warehouse.query.all()]
    if ctx["role"] == "warehouse_staff" and ctx["warehouse_id"]:
        return [ctx["warehouse_id"]]
    return []
