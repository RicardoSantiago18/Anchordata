from flask import request, jsonify
from src.services.maintenance_service import MaintenanceService


def create_maintenance():
    data = request.get_json()

    maintenance = MaintenanceService.create_maintenance(
        engineer_id=data['engineer_id'],
        machine_id=data['machine_id'],
        parada=data['parada'],
        downtime_minutes=data.get('downtime_minutes'),
        pecas_trocadas=data.get('pecas_trocadas'),
        resultado=data['resultado']
    )

    return jsonify(maintenance), 201

def list_machine_maintenances(machine_id):
    maintenances = MaintenanceService.list_by_machine(machine_id)
    return jsonify(maintenances), 200