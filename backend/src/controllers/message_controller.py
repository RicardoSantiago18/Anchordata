from flask import request, jsonify
from src.services.maintenance_flow_service import MaintenanceFlowService
from src.utils.mock_user import get_mock_user


def send_message(chat_id, current_user=None):
    """
    POST /chats/<chat_id>/messages
    Envia mensagem de usuário ou finaliza manutenção se finalize=True
    """
    try:
        current_user = current_user or get_mock_user()  # se não vier do auth, usa mock
        data = request.get_json() or {}

        content = data.get("content")
        finalize = data.get("finalize", False)
        machine_id = data.get("machine_id")
        maintenance_type = data.get("maintenance_type")

        if finalize:
            # Valida campos obrigatórios
            if not all([machine_id, maintenance_type]):
                return jsonify({
                    "error": "Para finalizar manutenção, machine_id e maintenance_type são obrigatórios."
                }), 400

            result = MaintenanceFlowService.finalize_maintenance(
                chat_id=chat_id,
                machine_id=machine_id,
                maintenance_type=maintenance_type
            )

            return jsonify(result), 200

        # Aqui você poderia salvar a mensagem no DB ou mock
        # Simula resposta do assistente
        assistant_response = f"Assistente recebeu: {content}"

        return jsonify({
            "assistant_message": assistant_response,
            "mode": "conversation"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def list_messages(chat_id):
    """
    GET /chats/<chat_id>/messages
    Retorna mensagens mock do chat
    """
    try:
        # Aqui poderia buscar mensagens reais do DB
        messages = [
            {"role": "user", "content": "Mensagem de teste do usuário"},
            {"role": "assistant", "content": "Resposta do assistente"}
        ]
        return jsonify(messages), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
