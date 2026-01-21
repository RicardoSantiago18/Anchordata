from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from database.db import db
from src.models.user_model import User

class Chat(db.Model):
    __tablename__ = "chats"

    # Identificador interno
    id: so.Mapped[int] = so.mapped_column(primary_key=True)

    # Identificação externa do chat
    mistral_chat_id: so.Mapped[str] = so.mapped_column(sa.String(255), unique=True, nullable=False)

    # Identificação do usuário do chat
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("users.id"), nullable=False, index=True)
    
    # Provider
    provider: so.Mapped[str] = so.mapped_column(sa.String(30), default="mistral", nullable=False)

    # Título do chat
    title: so.Mapped[str] = so.mapped_column(sa.String(256), index=True, nullable=False)

    # Auditoria
    created_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc))

    # Ultima interação
    updated_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Encerramento lógico
    is_active: so.Mapped[bool] = so.mapped_column(default=True)


    def __repr__(self):
        return f"<Chat {self.title}>"