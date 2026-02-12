from flask import jsonify
from src.services.maquina_service import MaquinaService
from src.services.timeline_event_service import TimelineEventService


def get_machine(machine_id: int):
    machine = MaquinaService.get_by_id(machine_id)

    if not machine:
        return jsonify({"error": "Máquina não encontrada"}), 404
    
    return jsonify(machine)


def get_machine_timeline(machine_id: int):
    events = TimelineEventService.list_events_by_machine(machine_id)

    return jsonify([
        {
            "id": e.id,
            "event_type": e.event_type,
            "title": e.title,
            "description": e.description,
            "created_at": e.created_at.isoformat(),
            "extra_data": e.extra_data
        }
        for e in events
    ])


def create_machine():
    from flask import request
    from datetime import datetime

    try:
        data = request.form
        imagem_file = request.files.get('imagem')
        manual_file = request.files.get('manual')

        # Validate required fields
        required_fields = ['nome_maquina', 'num_serie', 'data_fabricacao', 'marca', 'fabricante', 'setor', 'contato_fabricante', 'description']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({"error": f"Campos obrigatórios faltando: {', '.join(missing_fields)}"}), 400

        # Convert date
        try:
            # Assuming frontend sends YYYY-MM-DD
            data_fabricacao = datetime.strptime(data['data_fabricacao'], '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Formato de data inválido. Use YYYY-MM-DD"}), 400

        try:
            machine = MaquinaService.create_machine(
                nome_maquina=data['nome_maquina'],
                num_serie=data['num_serie'],
                data_fabricacao=data_fabricacao,
                marca=data['marca'],
                fabricante=data['fabricante'],
                setor=data['setor'],
                contato_fabricante=data['contato_fabricante'],
                description=data['description'],
                imagem_file=imagem_file,
                manual_file=manual_file
            )
        except Exception as e:
            # Handle unique constraint errors or others
            return jsonify({"error": f"Erro ao criar máquina: {str(e)}"}), 400

        # Return the created machine
        return jsonify(MaquinaService.get_by_id(machine.id)), 201

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


def serve_machine_file(filename):
    from flask import send_from_directory, current_app
    import os

    # The paths stored in DB are like "data/machines/<id>/<filename>"
    # We need to serve them. 
    # Let's assume the route passes the full relative path stored in DB, or we construct it.
    # Actually, the DB stores "data/machines/1/image.png". 
    # If the frontend requests "/api/machines/files/data/machines/1/image.png", that's a bit long.
    # Let's make the route endpoint be: /api/machines/files/<path:filepath>
    # where filepath matches what is stored in the DB (or a part of it).
    
    # Based on previous service logic:
    # base_dir is backend/data/machines/<id>/
    # storage in db: "data/machines/<id>/filename"
    
    # If we want to serve safely, we should be careful about traversing directories.
    # Let's assume the request comes in for the path stored in the DB.
    
    # We need the absolute path to the backend root usually.
    # In maquina_service it was: os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    # root_dir should be .../backend
    
    return send_from_directory(root_dir, filename)