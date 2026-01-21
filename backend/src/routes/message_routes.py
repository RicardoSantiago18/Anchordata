from flask import Blueprint
from src.controllers.message_controller import send_message, list_messages

message_bp = Blueprint(
    "messages",
    __name__,
    url_prefix="/chats/<int:chat_id>/messages"
)

message_bp.route("/", methods=["POST"])(send_message)
message_bp.route("/", methods=["GET"])(list_messages)
