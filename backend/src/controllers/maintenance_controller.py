from flask import request, jsonify
from src.services.maintenance_flow_service import MaintenanceFlowService


def finalize_maintenance(current_user=None):
    """
    POST /maintenance/finalize
    """
    try:
        current_user = current_user.id
        data = request.get_json()

        chat_id = data.get("chat_id")
        machine_id = data.get("machine_id")
        maintenance_type = data.get("maintenance_type")

        if not all([chat_id, machine_id, maintenance_type]):
            return jsonify({
                "error": "Campos obrigatórios ausentes: chat_id, machine_id, maintenance_type"
                }), 400

        result = MaintenanceFlowService.finalize_maintenance(
            chat_id=data["chat_id"],
            machine_id=data["machine_id"],
            user_id=current_user.id,
            maintenance_type=data["maintenance_type"],
        )

        return jsonify(result), 200
    
    except KeyError as e:
        return jsonify({"error": f"Campo obrigatório ausente: {str(e)}"}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500