from src.chains.report_chain import create_report_chain
from src.chains.event_chain import create_event_chain
from src.services.timeline_event_service import TimelineEventService
from src.models.chat_model import Chat
from src.models.message_model import Message
from src.services.pdf_service import PDFService
from pathlib import Path
from database.db import db


class MaintenanceFlowService:

    @staticmethod
    def load_file(path: str) -> str:
        return Path(path).read_text(encoding="utf-8")

    @staticmethod
    def finalize_maintenance(
        *,
        chat_id: int,
        machine_id: int,
        user_id: int,
        maintenance_type: str,
    ):
        """
        Finaliza uma manutenção:
        - Gera relatório Markdown via IA
        - Gera evento de timeline automaticamente
        - Persiste evento
        """

        # 1. Buscar chat
        chat = Chat.query.filter_by(
            id=chat_id,
            user_id=user_id,
            is_active=True
        ).first()

        if not chat:
            raise ValueError("Chat não encontrado para o usuário.")

        # 2. Buscar mensagens
        messages = (
            Message.query
            .filter_by(chat_id=chat.id)
            .order_by(Message.created_at.asc())
            .all()
        )

        # 3. Montar histórico (user -> assistant)
        history = []
        for i in range(len(messages) - 1):
            if messages[i].role == "user" and messages[i + 1].role == "assistant":
                history.append(
                    (messages[i].content, messages[i + 1].content)
                )

        if not history:
            raise ValueError("Histórico insuficiente para gerar relatório.")

        # 4. Gerar resumo técnico automaticamente
        technical_summary = "\n".join(
            [f"- {u}\n  {a}" for u, a in history[-5:]]
        )

        # 5. Escolher prompts e templates
        maintenance_type_lower = maintenance_type.lower()

        if maintenance_type_lower == "preventiva":
            system_prompt_report = MaintenanceFlowService.load_file("src/system_prompts/report_generator.txt")
            system_prompt_event = MaintenanceFlowService.load_file("src/system_prompts/event_generator.txt")
            report_template_markdown = MaintenanceFlowService.load_file("src/templates/maintenance/preventiva.md")
        else:
            system_prompt_report = MaintenanceFlowService.load_file("src/system_prompts/report_generator.txt")
            system_prompt_event = MaintenanceFlowService.load_file("src/system_prompts/event_generator.txt")
            report_template_markdown = MaintenanceFlowService.load_file("src/templates/maintenance/corretiva.md")

        # 6. Gerar relatório
        report_chain = create_report_chain()
        report_markdown = report_chain.invoke({
            "system_prompt": system_prompt_report,
            "maintenance_type": maintenance_type,
            "summary": technical_summary,
            "history": history,
            "template_markdown": report_template_markdown
        })

        pdf_path = PDFService.generate_pdf_from_markdown(
            markdown_content=report_markdown,
            filename=f"maintenance_{chat_id}.pdf"
        )

        # 7. Gerar evento
        event_chain = create_event_chain()
        event_data = event_chain.invoke({
            "system_prompt": system_prompt_event,
            "maintenance_type": maintenance_type,
            "summary": technical_summary,
            "history": history,
        })

        # 8. Persistir evento
        TimelineEventService.create_event(
            event_type=event_data.get("event_type", maintenance_type_lower),
            title=event_data.get("title", "Manutenção realizada"),
            description=event_data.get("description", report_markdown),
            users_id=user_id,
            conversation_history=history,
            machine_id=machine_id,
            chat_id=chat_id,
            extra_data=event_data.get("extra_data", {}),
        )

        # 9. Retorno
        return {
            "report_markdown": report_markdown,
            "pdf_path": pdf_path,
            "event": event_data,
        }
