from datetime import datetime, timezone
import sqlalchemy as sa
import sqlalchemy.orm as so
from database.db import db

class Maintenance(db.Model):
    __tablename__ = "maintenances"

    # Identificação da manutenção
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    
    # Relacionamentos
    engineer_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("engineers.id"), nullable=False)
    machine_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("maquinas.id"), nullable=False)

    # Data de hora de manutenção
    performed_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc))

    # Houve parada ou não?
    parada: so.Mapped[bool] = so.mapped_column(default=False)

    # Tempo de parada em minutos
    downtime_minutes: so.Mapped[int | None] = so.mapped_column(nullable=True)

    # Peças trocadas
    pecas_trocadas: so.Mapped[str | None] = so.mapped_column(sa.String(512), nullable=True)

    # Resultado da manutençõa
    resultado: so.Mapped[str] = so.mapped_column(sa.string(512), nullable=False)

    def __repr__(self):
        return f"<Maintenance machine={self.machine_id} engineer={self.engineer_id}>"