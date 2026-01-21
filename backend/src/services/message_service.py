from src.services.ai.ai_service import ai_service
from src.models.chat_model import Chat
from src.models.message_model import Message
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
        MAX_TURNS = 5

        for i in range(len(previous_messages) - 1):
            current = previous_messages[i]
            next_msg = previous_messages[i + 1]

            if current.role == "user" and next_msg.role == "assistant":
                history.append((current.content, next_msg.content))

        history = history[-MAX_TURNS:]

        # salva mensagem do usuário
        user_message = Message(
            chat_id=chat.id,
            role="user",
            content=content
        )
        db.session.add(user_message)

        # chamar IA aqui
        try:
            ai_response = ai_service.send_message(
                    question=content,
                    maintenance_mode=chat.maintenance_mode,
                    history=history
                )
        except Exception:
            ai_response = "Desculpe, ocorreu um erro ao processar sua solicitação."


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
