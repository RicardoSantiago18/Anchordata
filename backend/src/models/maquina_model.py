from typing import Optional
from datetime import datetime, timezone
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.orm import relationship
from database.db import db

class Machine(db.Model):
    __tablename__ = "machines"

    # Identificação da máquina
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    # Nome da máquina
    nome_maquina: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique = True)
    # numero de série
    num_serie: so.Mapped[str] = so.mapped_column(sa.String(128), unique=True, index=True)
    # Status da máquina
    status: so.Mapped[str] = so.mapped_column(sa.String(64), default=" Regime Saudável", nullable=False)
    # Data de criação
    created_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc))
    # Última atualização
    updated_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    # Descrição
    description: so.Mapped[str] = so.mapped_column(sa.String(512), index=True, nullable=False)
    # Ativo ou inativo
    is_active: so.Mapped[bool] = so.mapped_column(default=True)

    def __repr__(self):
        return f"<Machine {self.nome_maquina}>"