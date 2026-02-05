from flask import Blueprint
from src.controllers.maintenance_controller import finalize_maintenance


maintenance_bp = Blueprint("maintenance", __name__)

maintenance_bp.route(
    "/maintenance/finalize", methods=["POST"]
    )(finalize_maintenance)