from flask import Blueprint, make_response, request
from src.controllers.message_controller import send_message, list_messages

message_bp = Blueprint("messages", __name__, url_prefix="/chats")

# POST /chats/<chat_id>/messages
@message_bp.route("/<int:chat_id>/messages", methods=["POST", "OPTIONS"])
def send_message_route(chat_id):
    if request.method == "OPTIONS":
        return make_response("", 200)  # Responde ao preflight
    return send_message(chat_id)

# GET /chats/<chat_id>/messages
@message_bp.route("/<int:chat_id>/messages", methods=["GET", "OPTIONS"])
def list_messages_route(chat_id):
    if request.method == "OPTIONS":
        return make_response("", 200)  # Responde ao preflight
    return list_messages(chat_id)