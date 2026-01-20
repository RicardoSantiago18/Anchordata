from models.maquina_model import Machine
from database.db import db
from datetime import datetime, timezone

class MaquinaService:

    @staticmethod
    def create_machine(name: str, serial_number: str):
        machine = Machine(
            name = name,
            serial_number = serial_number,
            status = "Regime Saudável"
        )

        db.session.add(machine)
        db.session.commit()

        return {
            "id": machine.id,
            "name": machine.name,
            "status": machine.status
        }
    
    def list_machines():
        machines = Machine.query.filter_by(
            is_active = True
        ).all()

        return [
            {
                "id": machine.id,
                "name": machine.name,
                "status": machine.status
            }
            for machine in machines
        ]
    
    def update_status(machine_id: int, status: str):
        machine = Machine.query.filter_by(
            id=machine_id,
            is_active=True
        )

        if not machine:
            raise ValueError("Máquina não encontrada")
        
        machine.status = status
        machine.updated_at = datetime.now(timezone.utc)

    def get_home_machines():
        machines = Machine.query.filter_by(is_active=True).all()

        return [
            {
                "name": machine.name,
                "status": machine.status
            }
            for machine in machines
        ]