from pathlib import Path
from src.chains.report_chain import create_report_chain
from src.chains.event_chain import create_event_chain
from src.services.timeline_event_service import TimelineEventService
from src.services.pdf_service import PDFService
from src.models.chat_model import Chat
from database.db import db


class MaintenanceFlowService:

    @staticmethod
    def load_file(path: str) -> str:
        """Carrega o conteúdo de um arquivo."""
        return Path(path).read_text(encoding="utf-8")

    @staticmethod
    def finalize_maintenance(
        *,
        chat_id: int,
        machine_id: int,
        maintenance_type: str,
        draft_report: str = None
    ):
        """
        Finaliza uma manutenção:
        - Usa o draft_report preenchido durante a conversa
        - Gera relatório Markdown completo
        - Gera PDF
        - Cria evento de timeline
        """

        # 1. Buscar chat
        chat = Chat.query.filter_by(id=chat_id, is_active=True).first()
        if not chat:
            raise ValueError("Chat não encontrado para o chat_id informado.")

        # 2. Buscar mensagens recentes
        # (opcional, caso queira usar histórico no evento)
        messages = chat.messages.order_by(db.asc("created_at")).all() if hasattr(chat, "messages") else []
        history = []
        for i in range(len(messages) - 1):
            if messages[i].role == "user" and messages[i + 1].role == "assistant":
                history.append((messages[i].content, messages[i + 1].content))

        # 3. Definir prompts e templates
        maintenance_type_lower = maintenance_type.lower()
        system_prompt_report = MaintenanceFlowService.load_file("src/system_prompts/report_generator.txt")
        system_prompt_event = MaintenanceFlowService.load_file("src/system_prompts/event_generator.txt")

        if maintenance_type_lower == "preventiva":
            report_template_markdown = MaintenanceFlowService.load_file(
                "src/templates/maintenance/preventiva.md"
            )
        else:
            report_template_markdown = MaintenanceFlowService.load_file(
                "src/templates/maintenance/corretiva.md"
            )

        # 4. Gerar relatório final se draft_report não estiver completo
        if not draft_report:
            # Monta resumo técnico a partir do histórico das últimas interações
            technical_summary = "\n".join(
                [f"- {u}\n  {a}" for u, a in history[-5:]]
            )

            report_chain = create_report_chain()
            report_markdown = report_chain.invoke({
                "system_prompt": system_prompt_report,
                "maintenance_type": maintenance_type,
                "summary": technical_summary,
                "history": history,
                "template_markdown": report_template_markdown
            })
        else:
            # Usa o draft preenchido pela IA durante a conversa
            report_markdown = draft_report

        # 5. Gerar PDF
        pdf_path = PDFService.generate_pdf_from_markdown(
            markdown_content=report_markdown,
            filename=f"maintenance_{chat_id}.pdf"
        )

        # 6. Gerar evento de timeline
        event_chain = create_event_chain()
        event_data = event_chain.invoke({
            "system_prompt": system_prompt_event,
            "maintenance_type": maintenance_type,
            "summary": "Relatório finalizado com informações fornecidas pelo usuário",
            "history": history
        })

        TimelineEventService.create_event(
            event_type=event_data.get("event_type", maintenance_type_lower),
            title=event_data.get("title", "Manutenção realizada"),
            description=report_markdown,
            users_id=None,  # sem user_id
            conversation_history=history,
            machine_id=machine_id,
            chat_id=chat_id,
            extra_data=event_data.get("extra_data", {})
        )

        # 7. Retorno
        return {
            "report_markdown": report_markdown,
            "pdf_path": pdf_path,
            "event": event_data
        }
