from flask import Blueprint
from src.controllers.login_controller import login

login_bp = Blueprint("login", __name__)

login_bp.route("/login", methods=["POST"])(login)