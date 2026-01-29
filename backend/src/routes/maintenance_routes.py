from flask import Blueprint
from src.controllers.maintenance_controller import create_maintenance, list_machine_maintenances

maintenance_bp = Blueprint(
    'maintenance', 
    __name__, 
    url_prefix='/maintenances'
    )

maintenance_bp.routes("/", methods=["POST"])(create_maintenance)
maintenance_bp.routes("/machine/<int:machine_id>", methods=["GET"])(list_machine_maintenances)