from datetime import datetime, timezone
from database.db import db
from src.models.maintenance_model import Maintenance
from src.models.maquina_model import Machine

class MaintenanceService:

    @staticmethod
    def create_maintenance(
        engineer_id: int,
        machine_id: int,
        parada: bool,
        downtime_minutes: int | None,
        pecas_trocadas: str | None,
        resultado: str
    ):
        
        maintenance = Maintenance(
            engineer_id = engineer_id,
            machine_id = machine_id,
            parada = parada,
            downtime_minutes = downtime_minutes if parada else None,
            pecas_trocadas = pecas_trocadas,
            resultado = resultado,
            created_at = datetime.now(timezone.utc)
        )

        db.session.add(maintenance)
        db.session.commit()

        return {
            "id": maintenance.id,
            "machine_id": maintenance.machine_id,
            "created_at": maintenance.performed_at.isoformat(),
            "parada": maintenance.parada,
            "resultado": maintenance.resultado
        }
    
    @staticmethod
    def list_by_machine(machine_id: int):
        maintenances = (
            Maintenance.query.filter_by(machine_id=machine_id).order_by(Maintenance.performed_at.desc()).all()
        )

        return [
            {
                "id": m.id,
                "engineer_id": m.engineer_id,
                "machine_id": m.machine_id,
                "performed_at": m.performed_at.isoformat(),
                "parada": m.parada,
                "downtime_minutes": m.downtime_minutes,
                "pecas_trocadas": m.pecas_trocadas,
                "resultado": m.resultado
            }
            for m in maintenances
        ]