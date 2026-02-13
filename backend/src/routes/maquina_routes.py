from flask import Blueprint
from src.controllers.maquina_controller import (
    get_machine,
    get_machine_timeline
)

machine_bp = Blueprint("machines", __name__, url_prefix="/api")

@machine_bp.route("/machines", methods=["GET"])
def list_machines():
    from src.controllers.maquina_controller import get_all_machines
    return get_all_machines()

@machine_bp.route("/machines/<int:machine_id>", methods=["GET"])
def machine_detail(machine_id):
    return get_machine(machine_id)

@machine_bp.route("/machines/<int:machine_id>/timeline", methods=["GET"])
def machine_timeline(machine_id):
    return get_machine_timeline(machine_id)

from src.services.auth_service import role_required, token_required
from src.models.user_model import UserRole
from src.controllers.maquina_controller import create_machine

@machine_bp.route("/machines", methods=["POST"])
@token_required
@role_required(UserRole.GERENTE.value, UserRole.ADMIN.value)
def create_machine_route():
    return create_machine()

from src.controllers.maquina_controller import serve_machine_file

@machine_bp.route("/machines/files/<path:filename>", methods=["GET"])
def get_machine_file(filename):
    return serve_machine_file(filename)