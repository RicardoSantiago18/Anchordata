from flask import request, jsonify
from services.message_service import MessageService

def send_message(chat_id, current_user):
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify ({"error": "Mensagem vazia"}), 400
    
    response = MessageService.send_message(
        chat_id=chat_id,
        user_id=current_user.id,
        content=content
    )

    return jsonify(response), 201

def list_messages(chat_id, current_user):
    messages = MessageService.list_messages(chat_id, current_user.id)
    return jsonify(messages), 200