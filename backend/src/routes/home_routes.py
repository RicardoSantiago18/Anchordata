from flask import Blueprint
from src.controllers.home_controller import home

home_bp = Blueprint("home", __name__, url_prefix="/home")

home_bp.get("/")(home)