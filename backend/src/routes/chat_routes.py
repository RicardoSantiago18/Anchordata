from flask import Blueprint
from src.controllers.chat_controller import create_chat, list_chats, close_chat

chat_bp = Blueprint("chat", __name__, url_prefix="/chat")

chat_bp.route("", methods=["POST"], strict_slashes=False)(create_chat)
chat_bp.route("", methods=["GET"], strict_slashes=False)(list_chats)
chat_bp.route("/<int:chat_id>", methods=["DELETE"], strict_slashes=False)(close_chat)
