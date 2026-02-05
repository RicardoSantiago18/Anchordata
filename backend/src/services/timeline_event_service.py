from src.models.timeline_event_model import TimelineEvent
from database.db import db
import json


class TimelineEventService:

    @staticmethod
    def create_event(
        *,
        event_type: str,
        title: str,
        description: str,
        users_id: int,
        conversation_history: list,
        machine_id: int | None = None,
        chat_id: int | None = None,
        extra_data: dict | None = None,
    ):
        event = TimelineEvent(
            event_type=event_type,
            title=title,
            description=description,
            user_id=users_id,
            conversation_history=conversation_history,
            machine_id=machine_id,
            chat_id=chat_id,
            extra_data=extra_data or {},
        )

        db.session.add(event)
        db.session.commit()

        return event
    
    # Helpers semânticos

    @staticmethod
    def create_failure_event(**kwargs):
        return TimelineEventService.create_event(
            event_type="falha",
            **kwargs
        )

    @staticmethod
    def create_corrective_event(**kwargs):
        return TimelineEventService.create_event(
            event_type="corretiva",
            **kwargs
        )

    @staticmethod
    def create_preventive_event(**kwargs):
        return TimelineEventService.create_event(
            event_type="preventiva",
            **kwargs
        )

    @staticmethod
    def list_events_by_machine(machine_id: int):
        return (
            TimelineEvent.query
            .filter_by(machine_id=machine_id)
            .order_by(TimelineEvent.created_at.desc())
            .all()
        )