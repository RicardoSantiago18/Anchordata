from datetime import datetime, timezone
import sqlalchemy as sa
import sqlalchemy.orm as so
from database.db import db


class TimelineEvent(db.Model):
    __tablename__ = "timeline_events"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)

    # Relacionamentos principais
    machine_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("machines.id"), nullable=False, index=True
        )

    user_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("users.id"), nullable=False
        )

    chat_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("chats.id"), nullable=True
        )
    
    # Identificação do evento
    title: so.Mapped[str] = so.mapped_column(sa.String(128), nullable=False)
    description: so.Mapped[str] = so.mapped_column(sa.String(1024), nullable=True)
    # "falha", "corretiva" ou "preventiva"
    event_type: so.Mapped[str] = so.mapped_column(
        sa.Enum(
            "falha",
            "corretiva",
            "preventiva",
            name="timeline_event_type"
        ), 
        nullable=False)

    # Histórico do chat
    conversation_history: so.Mapped[list] = so.mapped_column(sa.JSON, nullable=False)

    #Dados específicos dos eventos
    extra_data: so.Mapped[dict] = so.mapped_column(sa.JSON, nullable=True)

    created_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<TimelineEvent {self.event_type} - {self.title}>"
