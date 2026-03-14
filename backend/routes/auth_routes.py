from flask import Blueprint, request, jsonify
from models.user_model import User
from extensions.db import db
from passlib.hash import bcrypt

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    hashed_password = bcrypt.hash(data["password"])

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_password,
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered"})


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.verify(data["password"], user.password_hash):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful",
        "role": user.role
    })