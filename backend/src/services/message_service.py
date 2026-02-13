import traceback
from src.services.ai.ai_service import ai_service
from src.models.chat_model import Chat
from src.models.message_model import Message
from src.services.maintenance_flow_service import MaintenanceFlowService
from database.db import db


class MessageService:

    @staticmethod
    def send_message(
        *,
        chat_id: int,
        content: str,
        finalize: bool = False,
        machine_id: int = None,
        maintenance_type: str = None
    ):
        # 1. Buscar chat ativo
        chat = Chat.query.filter_by(id=chat_id, is_active=True).first()
        if not chat:
            raise ValueError("Chat não encontrado")

        # 2. Histórico da conversa (user -> assistant)
        previous_messages = (
            Message.query
            .filter_by(chat_id=chat.id)
            .order_by(Message.created_at.asc())
            .all()
        )

        history = []
        MAX_TURNS = 5
        for i in range(len(previous_messages) - 1):
            if previous_messages[i].role == "user" and previous_messages[i + 1].role == "assistant":
                history.append((previous_messages[i].content, previous_messages[i + 1].content))
        history = history[-MAX_TURNS:]

        # 3. Salva mensagem do usuário
        user_message = Message(chat_id=chat.id, role="user", content=content)
        db.session.add(user_message)
        db.session.commit()

        # Transição para modo report
        if chat.mode == "maintenance" and content.strip().lower() in [
            "sim", "finalizada", "manutenção finalizada", "concluída", "concluida"
        ]:
            chat.mode = "report"
            chat.updated_at = db.func.now()
            db.session.commit()
            return {
                "mode": "transition",
                "assistant_message": "Perfeito. Vou iniciar a geração do relatório técnico. Caso falte alguma informação, irei solicitar."
            }

        # Se finalize=False, estamos em conversa técnica normal
        if not finalize:
            try:
                ai_response = ai_service.send_message(
                    question=content,
                    history=history,
                    mode=chat.mode
                )
            except Exception:
                print(traceback.format_exc())
                ai_response = {"user_facing_text": "Desculpe, ocorreu um erro ao processar sua solicitação."}

            # Salva resposta da IA
            assistant_message = Message(
                chat_id=chat.id,
                role="assistant",
                content=ai_response["user_facing_text"]
            )
            db.session.add(assistant_message)
            chat.updated_at = db.func.now()
            db.session.commit()

            return {
                "mode": "conversation",
                "assistant_message": ai_response["user_facing_text"]
            }

        # Se finalize=True, gera relatório final e PDF
        else:
            result = MaintenanceFlowService.finalize_maintenance(
                chat_id=chat.id,
                machine_id=machine_id,
                maintenance_type=maintenance_type
            )

            assistant_content = (
                "Manutenção finalizada com sucesso.\n"
                "Relatório técnico gerado e PDF disponível."
            )

            assistant_message = Message(
                chat_id=chat.id,
                role="assistant",
                content=assistant_content
            )
            db.session.add(assistant_message)

            chat.mode = "maintenance"  # volta para o modo padrão
            chat.updated_at = db.func.now()
            db.session.commit()

            return {
                "mode": "finalized",
                "assistant_message": assistant_content,
                "report_markdown": result["report_markdown"],
                "pdf_path": result["pdf_path"],
                "event": result["event"]
            }
