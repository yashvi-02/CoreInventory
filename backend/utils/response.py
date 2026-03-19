from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    return jsonify({
        "status": "success",
        "message": message,
        "data": {} if data is None else data
    }), status_code

def error_response(message="An error occurred", status_code=500):
    status = "error" if status_code >= 500 else "fail"
    return jsonify({
        "status": status,
        "message": message,
        "data": {}
    }), status_code
