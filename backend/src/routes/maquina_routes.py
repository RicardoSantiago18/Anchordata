from flask import Blueprint
from src.controllers.maquina_controller import (
    get_machine,
    get_machine_timeline,
    get_machine_metrics
)

machine_bp = Blueprint("machines", __name__, url_prefix="/api")

@machine_bp.route("/machines", methods=["GET"])
def list_machines():
    from src.controllers.maquina_controller import get_all_machines
    return get_all_machines()

@machine_bp.route("/machines/recent", methods=["GET"])
def recent_machines():
    from src.controllers.maquina_controller import get_recent_machines
    return get_recent_machines()

@machine_bp.route("/machines/status-summary", methods=["GET"])
def status_summary():
    from src.controllers.maquina_controller import get_status_summary
    return get_status_summary()

@machine_bp.route("/machines/<int:machine_id>", methods=["GET"])
def machine_detail(machine_id):
    return get_machine(machine_id)

@machine_bp.route("/machines/<int:machine_id>/timeline", methods=["GET"])
def machine_timeline(machine_id):
    return get_machine_timeline(machine_id)

@machine_bp.route("/machines/<int:machine_id>/metrics", methods=["GET"])
def machine_metrics(machine_id):
    return get_machine_metrics(machine_id)

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

from src.controllers.maquina_controller import update_machine, delete_machine

@machine_bp.route("/machines/<int:machine_id>", methods=["PUT"])
@token_required
@role_required(UserRole.GERENTE.value, UserRole.ADMIN.value)
def update_machine_route(machine_id):
    return update_machine(machine_id)

@machine_bp.route("/machines/<int:machine_id>", methods=["DELETE"])
@token_required
@role_required(UserRole.GERENTE.value, UserRole.ADMIN.value)
def delete_machine_route(machine_id):
    return delete_machine(machine_id)