from flask import request, jsonify, send_file
import os
from src.services.maintenance_flow_service import MaintenanceFlowService


def finalize_maintenance(current_user=None):
    """
    POST /maintenance/finalize
    """
    try:
        current_user = current_user  # se não veio, usa mock

        data = request.get_json()
        chat_id = data.get("chat_id")
        machine_id = data.get("machine_id")
        maintenance_type = data.get("maintenance_type")

        if not all([chat_id, machine_id, maintenance_type]):
            return jsonify({
                "error": "Campos obrigatórios ausentes: chat_id, machine_id, maintenance_type"
            }), 400

        result = MaintenanceFlowService.finalize_maintenance(
            chat_id=chat_id,
            machine_id=machine_id,
            maintenance_type=maintenance_type
        )

        print("\n===== MARKDOWN GERADO =====\n")
        print(result.get("report_markdown"))
        print("\n===========================\n")

        print("\n===== PDF GERADO =====\n")
        print(result.get("pdf_path"))
        print("\n=======================\n")

        return jsonify(result), 200

    except KeyError as e:
        return jsonify({"error": f"Campo obrigatório ausente: {str(e)}"}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def download_pdf(filename):
    """
    GET /reports/<filename>
    Faz download do PDF gerado
    """
    try:
        reports_dir = "data/reports"
        file_path = os.path.join(reports_dir, filename)
        
        # Validar segurança: garantir que só serve ficheiros de data/reports
        if not os.path.abspath(file_path).startswith(os.path.abspath(reports_dir)):
            return jsonify({"error": "Acesso negado"}), 403
        
        if not os.path.exists(file_path):
            return jsonify({"error": "Ficheiro não encontrado"}), 404
        
        return send_file(
            file_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500