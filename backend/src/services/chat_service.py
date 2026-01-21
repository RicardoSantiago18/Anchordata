from src.models.chat_model import Chat
from database.db import db
from datetime import datetime, timezone
import uuid

class ChatService:

    # Função obter chat ativo
    @staticmethod
    def _get_active_chat(chat_id, user_id):
        return Chat.query.filter_by(
            id=chat_id,
            user_id=user_id,
            is_active=True
        ).first()


    # Função criar chat
    @staticmethod
    def create_chat(user_id: int, title: str | None = None):
        chat = Chat(
            user_id = user_id,
            title = title or "Novo chat",
            provider = "mistral",
            mistral_chat_id=str(uuid.uuid4())
        )

        db.session.add(chat)
        db.session.commit()

        return {
            "id": chat.id,
            "title": chat.title,
            "created_at": chat.created_at.isoformat()
        }
    
    # Função listar chats
    @staticmethod
    def list_chats(user_id: int):
        chats = Chat.query.filter_by(
            user_id = user_id,
            is_active = True
        ).order_by(Chat.updated_at.desc()).all()

        return [
            {
                "id": chat.id,
                "title": chat.title,
                "updated_at": chat.updated_at.isoformat()
            }
            for chat in chats
        ]
    
    # Função encerrar um chat
    @staticmethod
    def close_chat(chat_id: int, user_id: int):
        chat = ChatService._get_active_chat(chat_id, user_id)
        if not chat:
            raise ValueError("Chat não encontrado")
        
        chat.is_active = False
        chat.updated_at = datetime.now(timezone.utc)

        db.session.commit()

        return True

    # Atualizar título do chat
    @staticmethod
    def update_title(chat_id: int, user_id: int, title: str):
        chat = ChatService._get_active_chat(chat_id, user_id)

        if not chat:
            raise ValueError("Chat não encontrado")
        
        chat.title = title
        chat.updated_at = datetime.now(timezone.utc)

        db.session.commit()

        return {
            "id": chat.id,
            "title": chat.title,
            "updated_at": chat.updated_at.isoformat()
        }