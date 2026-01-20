from datetime import datetime, timezone
import sqlalchemy as sa
import sqlalchemy.orm as so
from database.db import db

class Message(db.Model):
    __tablename__ = "messages"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)

    chat_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("chats.id", ondelete="CASCADE"),
        index=True
    )

    role: so.Mapped[str] = so.mapped_column(
        sa.String(20),
        nullable=False
    )

    content: so.Mapped[str] = so.mapped_column(sa.Text, nullable=False)

    created_at: so.Mapped[datetime] = so.mapped_column(
        default=lambda: datetime.now(timezone.utc)
    ) 

    def __repr__(self):
        return f"<Message {self.role}: {self.content[:30]}>"