from flask import Blueprint
from controllers.home_controller import home

home_bp = Blueprint("home", __name__)

home_bp.route("/home", methods=["GET"])(home)