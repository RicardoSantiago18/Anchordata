from flask import jsonify
from services.maquina_service import MaquinaService
from services.timeline_event_service import TimelineEventService


def get_machine(machine_id: int):
    machine = MaquinaService.get_by_id(machine_id)

    if not machine:
        return jsonify({"error": "Máquina não encontrada"}), 404
    
    return jsonify(machine)


def get_machine_timeline(machine_id: int):
    events = TimelineEventService.list_events_by_machine(machine_id)

    return jsonify([
        {
            "id": e.id,
            "event_type": e.event_type,
            "title": e.title,
            "description": e.description,
            "created_at": e.created_at.isoformat(),
            "extra_data": e.extra_data
        }
        for e in events
    ])