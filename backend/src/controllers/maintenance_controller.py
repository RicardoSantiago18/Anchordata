from flask import request, jsonify
from src.services.maintenance_flow_service import MaintenanceFlowService


def finalize_maintenance(current_user=None):
    """
    POST /maintenance/finalize
    """
    try:
        current_user = current_user
        data = request.get_json()

        result = MaintenanceFlowService.finalize_maintenance(
            chat_id=data["chat_id"],
            machine_id=data["machine_id"],
            user_id=current_user.id,
            maintenance_type=data["maintenance_type"],
            system_prompt_report=data["system_prompt_report"],
            system_prompt_event=data["system_prompt_event"],
            report_template_markdown=data["report_template_markdown"],
            technical_summary=data["technical_summary"],
        )

        return jsonify(result), 200
    
    except KeyError as e:
        return jsonify({"error": f"Campo obrigatório ausente: {str(e)}"}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500