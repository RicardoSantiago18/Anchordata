from pathlib import Path
from src.chains.report_chain import create_report_chain
from src.rag_chain import create_chain
from src.chains.event_chain import create_event_chain
from src.services.timeline_event_service import TimelineEventService
from src.services.pdf_service import PDFService
from src.models.chat_model import Chat
from src.models.message_model import Message
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
    ):
        """
        Finaliza uma manutenção:
        - Gera relatório Markdown completo a partir do histórico
        - Gera PDF
        - Cria evento de timeline
        """

        # 1. Buscar chat
        chat = Chat.query.filter_by(id=chat_id, is_active=True).first()
        if not chat:
            raise ValueError("Chat não encontrado para o chat_id informado.")

        # 2. Buscar mensagens recentes
        messages = Message.query.filter_by(chat_id=chat.id).order_by(Message.created_at.asc()).all()
        history = [
            (messages[i].content, messages[i + 1].content)
            for i in range(len(messages) - 1)
            if messages[i].role == "user" and messages[i + 1].role == "assistant"
        ]

        # 3. Definir prompts e templates
        maintenance_type_lower = maintenance_type.lower()
        system_prompt_report = MaintenanceFlowService.load_file("src/system_prompts/report_generator.txt")
        system_prompt_event = MaintenanceFlowService.load_file("src/system_prompts/event_generator.txt")

        if maintenance_type_lower == "preventiva":
            report_template_markdown = MaintenanceFlowService.load_file("src/templates/maintenance/preventiva.md")
        else:
            report_template_markdown = MaintenanceFlowService.load_file("src/templates/maintenance/corretiva.md")

        print("[DEBUG] Template length:", len(report_template_markdown))
        print("[DEBUG] Template preview:\n", report_template_markdown[:500])

        # 4. Monta resumo técnico a partir do histórico
        technical_summary = "\n".join([f"- {u}\n  {a}" for u, a in history[-5:]])
        history_text = "\n".join(f"Usuário: {u}\nAssistente: {a}" for u, a in history)

        print("[DEBUG] History length:", len(history))
        print("[DEBUG] Technical summary:\n", technical_summary[:500])

        report_markdown = None

        # 5. Tentar report_chain
        try:
            report_chain = create_report_chain()
            response = report_chain.invoke({
                "system_prompt": system_prompt_report,
                "maintenance_type": maintenance_type,
                "summary": technical_summary,
                "history": history_text,
                "template_markdown": report_template_markdown
            })

            if response and isinstance(response, str) and response.strip() != "" and "erro" not in response.lower():
                report_markdown = response

            print("[DEBUG] report_chain.invoke returned:", report_markdown[:500] if report_markdown else None)
        except Exception as e:
            print(f"[WARN] report_chain.invoke failed: {e}")

        # 6. Fallback RAG chain se ainda não gerou
        if not report_markdown:
            try:
                rag_chain, _, _ = create_chain("report_generator.txt")
                question = (
                    f"Gere o relatório final em Markdown usando o modelo abaixo:\n\n"
                    f"{report_template_markdown}\n\nResumo técnico:\n{technical_summary}"
                )

                report_markdown = rag_chain.invoke({
                    "question": question,
                    "history": history_text
                })

                if not report_markdown or report_markdown.strip() == "":
                    raise ValueError("RAG chain não retornou conteúdo válido.")

                print("[DEBUG] rag_chain returned length:", len(report_markdown))
            except Exception as e:
                print(f"[ERROR] rag_chain.invoke failed: {e}")
                report_markdown = f"Falha ao gerar relatório. Resumo técnico disponível:\n{technical_summary}"

        # 7. Pós-processamento: garantir preenchimento de todos os campos obrigatórios
        report_markdown = report_markdown or f"Falha ao gerar relatório. Resumo técnico disponível:\n{technical_summary}"
        mandatory_fields = [
            "Data:", "Responsável pela Manutenção:", "ID:", "Máquina:", "Código da Máquina:",
            "Descrição do problema:", "Causas detectadas:", "Houve parada:", "Tempo de parada:",
            "Medidas tomadas:", "Início da intervenção:", "Duração:", "Resultado das medidas:",
            "Peças trocadas:", "Descrição das peças:", "Observações:", "Resultado Final da Manutenção:"
        ]

        for field in mandatory_fields:
            # se o campo existir mas estiver vazio
            if field not in report_markdown or f"{field} " == report_markdown.split(field)[-1].strip():
                report_markdown = report_markdown.replace(field, f"{field} Não informado")

        # 8. Gerar PDF
        pdf_path = PDFService.generate_pdf_from_markdown(
            markdown_content=report_markdown,
            filename=f"maintenance_{chat_id}.pdf"
        )

        # 9. Gerar evento de timeline
        try:
            event_chain = create_event_chain()
            event_data = event_chain.invoke({
                "system_prompt": system_prompt_event,
                "maintenance_type": maintenance_type,
                "summary": "Relatório finalizado com informações fornecidas pelo usuário",
                "history": history
            })
        except Exception as e:
            print(f"[WARN] event_chain.invoke failed: {e}")
            event_data = {}

        TimelineEventService.create_event(
            event_type=event_data.get("event_type", maintenance_type_lower),
            title=event_data.get("title", "Manutenção realizada"),
            description=report_markdown,
            users_id=chat.user_id,
            conversation_history=history,
            machine_id=machine_id,
            chat_id=chat_id,
            extra_data=event_data.get("extra_data", {})
        )

        # 10. Retorno
        return {
            "report_markdown": report_markdown,
            "pdf_path": pdf_path,
            "event": event_data
        }
