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
    # data de fabricação
    data_fabricacao: so.Mapped[datetime] = so.mapped_column(sa.DateTime, nullable=False)
    #Marca da máquina
    marca: so.Mapped[str] = so.mapped_column(sa.String(64), nullable=False)
    # Fabricante da máquina
    fabricante: so.Mapped[str] = so.mapped_column(sa.String(128), nullable=False)
    # Setor de funcionamento
    setor: so.Mapped[str] = so.mapped_column(sa.String(64), nullable=False)
    # Contato do fabricante
    contato_fabricante: so.Mapped[str] = so.mapped_column(sa.String(128), nullable=False)
    # Status da máquina
    status: so.Mapped[str] = so.mapped_column(sa.String(64), default=" Regime Saudável", nullable=False)
    # Data de criação
    created_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc))
    # Última atualização
    updated_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    # Descrição
    description: so.Mapped[str] = so.mapped_column(sa.String(512), index=True, nullable=False)

    # Imagem da máquina
    imagem: so.Mapped[str] = so.mapped_column(sa.String(256), nullable=True)
    # Manual da máquina
    manual: so.Mapped[str] = so.mapped_column(sa.String(256), nullable=True)

    def __repr__(self):
        return f"<Machine {self.nome_maquina}>"