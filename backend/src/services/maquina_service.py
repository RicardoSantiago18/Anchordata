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
        description: str,
        imagem_file=None,
        manual_file=None
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

        # Handle file uploads
        if imagem_file or manual_file:
            import os
            from werkzeug.utils import secure_filename
            from flask import current_app

            # Define base path for machine files: backend/data/machines/<id>/
            base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'machines', str(machine.id))
            os.makedirs(base_dir, exist_ok=True)

            if imagem_file:
                filename = secure_filename(imagem_file.filename)
                file_path = os.path.join(base_dir, filename)
                imagem_file.save(file_path)
                # Store relative path or absolute? Relative is better for portability.
                # Let's store relative to backend root or just filename if structured.
                # The plan said "save file paths in the database".
                # Let's store "data/machines/<id>/<filename>"
                machine.imagem = f"data/machines/{machine.id}/{filename}"

            if manual_file:
                filename = secure_filename(manual_file.filename)
                file_path = os.path.join(base_dir, filename)
                manual_file.save(file_path)
                machine.manual = f"data/machines/{machine.id}/{filename}"

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
            "imagem": machine.imagem,
            "manual": machine.manual,
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
