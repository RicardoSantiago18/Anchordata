from flask import jsonify, request
from src.services.chat_service import ChatService
from datetime import datetime

def create_chat(current_user=None):
    """
    Cria um novo chat
    Retorna: { "id": 1, "created_at": "2026-01-21T10:00:00", "title": "Chat 1" }
    """
    try:
        data = request.get_json() or {}
        title = data.get('title', f'Chat {datetime.now().strftime("%H:%M")}')
        
        chat = ChatService.create_chat(
            user_id=current_user.id,
            title=title
        )
        
        return jsonify(chat), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def list_chats(current_user=None):
    """
    GET / chat
    """
    try:
        # Mock: Simula lista de chats
        chats = ChatService.list_chats(current_user.id)
        return jsonify(chats), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def close_chat(chat_id, current_user=None):
    """
    DELETE /chat/<chat_id>
    """
    try:
        ChatService.close_chat(chat_id, current_user.id)
        return jsonify({"message": "Chat encerrado com sucesso", "chat_id": chat_id}), 200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
