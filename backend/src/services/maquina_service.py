from src.models.maquina_model import Machine
from database.db import db
from datetime import datetime, timezone


class MaquinaService:

    @staticmethod
    def create_machine(
        *,
        nome_maquina: str,
        num_serie: str,
        data_fabricacao: datetime,
        marca: str,
        fabricante: str,
        setor: str,
        contato_fabricante: str,
        description: str
    ):
        machine = Machine(
            nome_maquina=nome_maquina,
            num_serie=num_serie,
            data_fabricacao=data_fabricacao,
            marca=marca,
            fabricante=fabricante,
            setor=setor,
            contato_fabricante=contato_fabricante,
            description=description,
            status="Regime Saudável"
        )

        db.session.add(machine)
        db.session.commit()

        return machine

    # CONSULTAS
    @staticmethod
    def list_machines():
        machines = Machine.query.all()

        return [
            {
                "id": m.id,
                "nome_maquina": m.nome_maquina,
                "num_serie": m.num_serie,
                "status": m.status,
            }
            for m in machines
        ]

    @staticmethod
    def get_by_id(machine_id: int):
        machine = Machine.query.filter_by(id=machine_id).first()

        if not machine:
            return None

        return {
            "id": machine.id,
            "nome_maquina": machine.nome_maquina,
            "num_serie": machine.num_serie,
            "status": machine.status,
            "marca": machine.marca,
            "fabricante": machine.fabricante,
            "setor": machine.setor,
            "description": machine.description,
            "data_fabricacao": machine.data_fabricacao.isoformat(),
            "created_at": machine.created_at.isoformat(),
        }

    # ATUALIZAÇÕES
    @staticmethod
    def update_status(machine_id: int, status: str):
        machine = Machine.query.filter_by(id=machine_id).first()

        if not machine:
            raise ValueError("Máquina não encontrada")

        machine.status = status
        machine.updated_at = datetime.now(timezone.utc)

        db.session.commit()

        return machine
