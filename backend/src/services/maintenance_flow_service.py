from src.chains.report_chain import create_report_chain
from src.chains.event_chain import create_event_chain
from src.services.timeline_event_service import TimelineEventService
from src.models.chat_model import Chat
from database.db import db


class MaintenanceFlowService:

    @staticmethod
    def finalize_maintenance(
        *,
        chat_id: int,
        machine_id: int,
        user_id: int,
        maintenance_type: str,
        system_prompt_report: str,
        system_prompt_event: str,
        report_template_markdown: str,
        technical_summary: str,
    ):
        """
        Finaliza uma manutenção:
        - Gera relatório Markdown
        - Gera evento de timeline
        - Persiste evento
        """

        # Busca o chat e seu histórico
        chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
        if not chat:
            raise ValueError("Chat não encontrado para o usuário.")
        
        conversation_history = chat.messages

        # Gerar relatório técnico
        report_chain = create_report_chain()

        report_markdown = report_chain.invoke({
            "system_prompt": system_prompt_report,
            "maintenance_type": maintenance_type,
            "summary": technical_summary,
            "history": conversation_history,
            "template_markdown": report_template_markdown
        })

        # Gerar evento de timeline
        event_chain = create_event_chain()

        event_data = event_chain.invoke({
            "system_prompt": system_prompt_event,
            "maintenance_type": maintenance_type,
            "summary": technical_summary,
            "history": conversation_history,
        })

        # Criar evento automaticamente
        TimelineEventService.create_event(
            event_type=event_data.get["event_type", maintenance_type.lower()],
            title=event_data.get["title", "Manutenção realizada"],
            description=event_data.get["description"],
            users_id=user_id,
            conversation_history=conversation_history,
            machine_id=machine_id,
            chat_id=chat_id,
            extra_data=event_data.get("extra_data", {}),
        )

        # Retorno
        return {
            "report_markdown": report_markdown,
            "event_data": event_data,
        }