from flask import Blueprint
from src.controllers.message_controller import send_message, list_messages
from flask_cors import cross_origin

message_bp = Blueprint("messages", __name__, url_prefix="/chats")

# POST /chats/<chat_id>/messages
@message_bp.route("/<int:chat_id>/messages", methods=["POST", "OPTIONS"], strict_slashes=False)
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def send_message_route(chat_id):
    return send_message(chat_id)

# GET /chats/<chat_id>/messages
@message_bp.route("/<int:chat_id>/messages", methods=["GET", "OPTIONS"], strict_slashes=False)
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def list_messages_route(chat_id):
    return list_messages(chat_id)
