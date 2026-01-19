from flask import jsonify
from services.chat_service import ChatService

def create_chat(current_user):
    chat = ChatService.create_chat(user_id=current_user.id)
    return jsonify(chat), 201


def list_chats(current_user):
    chats = ChatService.list_chats(user_id=current_user.id)
    return jsonify(chats), 200

def close_chat(chat_id, current_user):
    try:
        ChatService.close_chat(chat_id, current_user.id)
        return jsonify({"message": "Chat encerrado"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
