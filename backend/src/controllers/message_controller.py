from flask import request, jsonify
from src.services.message_service import MessageService
from src.services.ai.ai_service import AIService

def send_message(chat_id, current_user):
    """
    POST /chats/<chat_id>/messages
    """

    try:
        data = request.get_json() or {}
        content = data.get("message")

        if not content:
            return jsonify({"Error": "Mensagem é obrigatória"}), 400

        # Salvar pergunta + resposta no banco
        response = MessageService.send_message(
            chat_id=chat_id,
            user_id=current_user.id,
            content=content
        )

        return jsonify(response), 201
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def list_messages(chat_id, current_user):
    """
    DGET /chats/<chat_id>/messages
    """

    try:
        messages = MessageService.list_messages(chat_id, current_user.id)
        return jsonify(messages), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

