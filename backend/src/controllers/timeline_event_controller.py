from flask import jsonify
from services.timeline_event_service import TimelineEventService


def list_timeline(machine_id):
    events = TimelineEventService.list_events_by_machine(machine_id)

    return jsonify([
        {
            "id": e.id,
            "type": e.event_type,
            "title": e.title,
            "description": e.description,
            "created_at": e.created_at.isoformat(),
            "extra_data": e.extra_data
        }
        for e in events
    ])