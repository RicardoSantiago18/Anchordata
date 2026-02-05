from flask import Blueprint
from controllers.maquina_controller import (
    get_machine,
    get_machine_timeline
)

machine_bp = Blueprint("machines", __name__)

@machine_bp.route("/machines/<int:machine_id>", methods=["GET"])
def machine_detail(machine_id):
    return get_machine(machine_id)

@machine_bp.route("/machines/<int:machine_id>/timeline", methods=["GET"])
def machine_timeline(machine_id):
    return get_machine_timeline(machine_id)