from services.ai.ai_service import ai_service
from models.chat_model import Chat
from models.message_model import Message
from database.db import db

class MessageService:

    @staticmethod
    def send_message(chat_id: int, user_id: int, content: str):
        chat = Chat.query.filter_by(
            id=chat_id,
            user_id=user_id,
            is_active=True
        ).first()

        if not chat:
            raise ValueError("Chat não encontrado")
        
        # histórico do chat
        previous_messages = (
            Message.query
            .filter_by(chat_id=chat.id)
            .order_by(Message.created_at.asc())
            .all()
        )

        # Histórico
        history = []
        last_user_message = None

        for msg in previous_messages:
            if msg.role == "user":
                last_user_message = msg.content
            elif msg.role == "assistant" and last_user_message:
                history.append((last_user_message, msg.content))
                last_user_message = None

        # salva mensagem do usuário
        user_message = Message(
            chat_id=chat.id,
            role="user",
            content=content
        )
        db.session.add(user_message)

        # chamar IA aqui
        ai_response = ai_service.send_message(
            question = content,
            maintenance_mode="Manutenção Corretiva",
            history=history
        )

        assistant_message = Message(
            chat_id=chat.id,
            role="assistant",
            content=ai_response
        )
        db.session.add(assistant_message)

        chat.updated_at = db.func.now()
        db.session.commit()

        return {
            "user_message": content,
            "assistant_message": ai_response
        }

    @staticmethod
    def list_messages(chat_id: int, user_id: int):
        messages = (
            Message.query
            .join(Chat)
            .filter(Chat.id == chat_id, Chat.user_id == user_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        return [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat()
            }
            for m in messages
        ]
