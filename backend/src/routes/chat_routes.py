from flask import Blueprint
from src.controllers.chat_controller import create_chat, list_chats, close_chat

chat_bp = Blueprint("chat", __name__, url_prefix="/chats")

chat_bp.route("/", methods=["POST"])(create_chat)
chat_bp.route("/", methods=["GET"])(list_chats)
chat_bp.route("/<int:chat_id>", methods=["DELETE"])(close_chat)
