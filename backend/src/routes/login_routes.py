from flask import Blueprint
from src.controllers.login_controller import login, logout

login_bp = Blueprint("login", __name__, url_prefix="/api/auth")

login_bp.route("/login", methods=["POST"])(login)
login_bp.route("/logout", methods=["POST"])(logout)
