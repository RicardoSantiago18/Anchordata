from src.models.maquina_model import Machine
from src.models.timeline_event_model import TimelineEvent
from database.db import db
from datetime import datetime, timezone
from sqlalchemy import func, desc


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

            base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'machines', str(machine.id))
            os.makedirs(base_dir, exist_ok=True)

            if imagem_file:
                filename = secure_filename(imagem_file.filename)
                file_path = os.path.join(base_dir, filename)
                imagem_file.save(file_path)
                machine.imagem = f"data/machines/{machine.id}/{filename}"

            if manual_file:
                filename = secure_filename(manual_file.filename)
                file_path = os.path.join(base_dir, filename)
                manual_file.save(file_path)
                machine.manual = f"data/machines/{machine.id}/{filename}"

            db.session.commit()

        # Index machine metadata + manual into per-machine vectorstore
        try:
            from src.ingest import index_machine_to_rag
            index_machine_to_rag(machine)
        except Exception as e:
            print(f"[WARN] falha ao indexar máquina no vectorstore: {e}")

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
                "imagem": m.imagem,
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

    @staticmethod
    def update_machine(
        machine_id: int,
        *,
        nome_maquina: str = None,
        num_serie: str = None,
        data_fabricacao: datetime = None,
        marca: str = None,
        fabricante: str = None,
        setor: str = None,
        contato_fabricante: str = None,
        description: str = None,
        imagem_file=None,
        manual_file=None
    ):
        import os
        machine = Machine.query.filter_by(id=machine_id).first()

        if not machine:
            raise ValueError("Máquina não encontrada")

        if nome_maquina is not None:
            machine.nome_maquina = nome_maquina
        if num_serie is not None:
            machine.num_serie = num_serie
        if data_fabricacao is not None:
            machine.data_fabricacao = data_fabricacao
        if marca is not None:
            machine.marca = marca
        if fabricante is not None:
            machine.fabricante = fabricante
        if setor is not None:
            machine.setor = setor
        if contato_fabricante is not None:
            machine.contato_fabricante = contato_fabricante
        if description is not None:
            machine.description = description

        machine.updated_at = datetime.now(timezone.utc)

        # Handle file replacements
        if imagem_file or manual_file:
            from werkzeug.utils import secure_filename

            base_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'data', 'machines', str(machine.id)
            )
            os.makedirs(base_dir, exist_ok=True)

            if imagem_file:
                filename = secure_filename(imagem_file.filename)
                file_path = os.path.join(base_dir, filename)
                imagem_file.save(file_path)
                machine.imagem = f"data/machines/{machine.id}/{filename}"

            if manual_file:
                filename = secure_filename(manual_file.filename)
                file_path = os.path.join(base_dir, filename)
                manual_file.save(file_path)
                machine.manual = f"data/machines/{machine.id}/{filename}"

        db.session.commit()

        # Re-index: remove old vectorstore and rebuild with updated data
        try:
            from src.ingest import remove_machine_from_rag, index_machine_to_rag
            remove_machine_from_rag(machine.id)
            index_machine_to_rag(machine)
        except Exception as e:
            print(f"[WARN] falha ao re-indexar máquina no vectorstore: {e}")

        return machine

    # REMOÇÃO
    @staticmethod
    def delete_machine(machine_id: int):
        import os
        import shutil

        machine = Machine.query.filter_by(id=machine_id).first()

        if not machine:
            raise ValueError("Máquina não encontrada")

        # Remove vectorstore for this machine
        try:
            from src.ingest import remove_machine_from_rag
            remove_machine_from_rag(machine_id)
        except Exception as e:
            print(f"[WARN] falha ao remover vectorstore da máquina: {e}")

        # Remove files from disk
        base_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data', 'machines', str(machine_id)
        )
        if os.path.exists(base_dir):
            shutil.rmtree(base_dir)

        db.session.delete(machine)
        db.session.commit()

    @staticmethod
    def get_recent_interacted(limit: int = 4):
        """
        Retorna as últimas máquinas que tiveram interações (timeline events),
        ordenadas pela interação mais recente.
        """
        subq = (
            db.session.query(
                TimelineEvent.machine_id,
                func.max(TimelineEvent.created_at).label("last_interaction")
            )
            .group_by(TimelineEvent.machine_id)
            .subquery()
        )

        results = (
            db.session.query(Machine, subq.c.last_interaction)
            .join(subq, Machine.id == subq.c.machine_id)
            .order_by(desc(subq.c.last_interaction))
            .limit(limit)
            .all()
        )

        return [
            {
                "id": m.id,
                "nome_maquina": m.nome_maquina,
                "num_serie": m.num_serie,
                "status": m.status,
                "imagem": m.imagem,
                "last_interaction": last.isoformat() if last else None,
            }
            for m, last in results
        ]
