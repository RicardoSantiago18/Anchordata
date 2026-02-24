from flask import Blueprint
from src.controllers.chat_controller import create_chat, list_chats, close_chat

chat_bp = Blueprint("chats", __name__, url_prefix="/api/chats")

@chat_bp.route("", methods=["POST"])
def create_chat_route():
    return create_chat()

@chat_bp.route("", methods=["GET"])
def list_chats_route():
    return list_chats()

@chat_bp.route("/<int:chat_id>", methods=["DELETE"])
def close_chat_route(chat_id):
    return close_chat(chat_id)