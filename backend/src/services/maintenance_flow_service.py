from pathlib import Path
import os
from datetime import datetime
from src.chains.report_chain import create_report_chain
from src.rag_chain import create_chain
from src.chains.event_chain import create_event_chain
from src.services.timeline_event_service import TimelineEventService
from src.services.pdf_service import PDFService
from src.models.chat_model import Chat
from src.models.message_model import Message
from src.models.maquina_model import Machine
from src.models.user_model import User
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

        # fetch machine metadata to provide context
        machine = Machine.query.filter_by(id=machine_id).first()
        machine_info = ""

        if machine:
            machine_info = (
                f"Máquina: {machine.nome_maquina}\n"
                f"Serial: {machine.num_serie}\n"
                f"Marca: {machine.marca}\n"
                f"Fabricante: {machine.fabricante}\n"
                f"Manual: {machine.manual or 'nenhum'}"
            )

        # Buscar usuário responsável
        user = User.query.filter_by(id=chat.user_id).first()
        responsible_name = user.name if user else "Não informado"

        # Calcular tempo a partir de mensagens
        intervation_start = "Não informado"
        duration = "Não informado"

        # 2. Buscar mensagens recentes
        messages = Message.query.filter_by(chat_id=chat.id).order_by(Message.created_at.asc()).all()
        history = [
            (messages[i].content, messages[i + 1].content)
            for i in range(len(messages) - 1)
            if messages[i].role == "user" and messages[i + 1].role == "assistant"
        ]

        if messages:
            first_msg_time = messages[0].created_at
            last_msg_time = messages[-1].created_at
            intervention_start = first_msg_time.strftime("%d/%m/%Y %H:%M:%S")
            delta = last_msg_time - first_msg_time
            total_minutes = int(delta.total_seconds() // 60)
            duration = f"{total_minutes} min"

        maintenance_metadata = (
            f"DADOS DA MANUTENÇÃO:\n"
            f"- Data: {chat.created_at.strftime('%d/%m/%Y')}\n"
            f"- Responsável: {responsible_name}\n"
            f"- ID da Manutenção: {chat.id}\n"
            f"- Tipo: {maintenance_type}\n"
            f"- Início da Intervenção: {intervention_start}\n"
            f"- Duração: {duration}\n"
            f"- Tempo de Parada: {duration}\n"
        )

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

        # 5. Tentar report_chain (com histórico truncado para evitar overflow de tokens)
        try:
            report_chain = create_report_chain()
            
            full_history = "\n".join(f"Usuário: {u}\nAssistente: {a}" for u, a in history)
            
            # Limitar summary também se ficar muito grande
            truncated_summary = technical_summary if len(technical_summary) < 1000 else technical_summary[:1000] + "..."
            
            response = report_chain.invoke({
                "system_prompt": system_prompt_report,
                "maintenance_type": maintenance_type,
                "summary": truncated_summary,
                "history": full_history,
                "template_markdown": report_template_markdown,
                "machine_info": machine_info,
                "maintenance_metadata": maintenance_metadata,
            })

            if response and isinstance(response, str) and response.strip() != "" and "erro" not in response.lower():
                report_markdown = response

            print("[DEBUG] report_chain.invoke returned:", report_markdown[:500] if report_markdown else None)
        except Exception as e:
            print(f"[WARN] report_chain.invoke failed: {e}")

        # 6. Fallback RAG chain se ainda não gerou
        if not report_markdown:
            try:
                print("[INFO] Tentando RAG chain para gerar relatório...")
                rag_chain, _, _ = create_chain("report_generator.txt")
                
                # RAG chain espera apenas {question} e {history}, não template_markdown ou summary
                question = (
                    f"Com base no histórico e na conversa, gere um relatório de manutenção em Markdown. "
                    f"Resumo técnico: {technical_summary[:300]}"
                )

                # Para evitar KeyError caso o prompt exija outros campos (summary, machine_info, template_markdown),
                # fornecemos valores mesmos quando a chain é usada como fallback.
                rag_template = report_template_markdown
                if len(rag_template) > 2000:
                    rag_template = rag_template[:2000] + "\n\n...[TEMPLATE TRUNCADO]"

                rag_response = rag_chain.invoke({
                    "question": question,
                    "history": history[-3:] if history else [],  # Apenas últimas 3 mensagens
                    "machine_id": machine_id,
                    "summary": truncated_summary,
                    "machine_info": machine_info,
                    "template_markdown": rag_template,
                })

                if rag_response and isinstance(rag_response, str) and rag_response.strip() != "":
                    report_markdown = rag_response
                    print("[DEBUG] rag_chain retornou length:", len(report_markdown))
                else:
                    print(f"[WARN] RAG chain retornou resposta vazia ou inválida")
            except Exception as e:
                print(f"[ERROR] rag_chain falhou: {type(e).__name__}: {str(e)[:200]}")

        # 7. Último fallback: preencher template manualmente com dados do histórico
        if not report_markdown:
            print("[INFO] Usando fallback de preenchimento de template")
            report_markdown = report_template_markdown
            
            # Extrair dados do histórico para preencher campos obrigatórios
            last_user_msg = history[-1][0] if history else "Informação não disponível"
            last_assistant_msg = history[-1][1] if history else "Informação não disponível"
            
            replacements = {
                "- **Data:**": f"- **Data:** {chat.created_at.strftime('%d/%m/%Y')}",
                "- **Responsável pela Manutenção:**": f"- **Responsável pela Manutenção:** {responsible_name}",
                "- **ID:**": f"- **ID:** {chat.id}",
                "Inicio da intervenção:": f"- **Início da intervenção:** {intervention_start}",
                "- **Duração:**": f"- **Duração:** {duration}",
                "- **Tempo de parada:**": f"- **Tempo de parada:** {duration}",
                "- **Descrição do problema:**": f"- **Descrição do problema:** {last_user_msg}",
                "- **Medidas tomadas:**": f"- **Medidas tomadas:** {last_assistant_msg}",
                "- **Resultado das medidas:**": f"- **Resultado das medidas:** Ação concluída conforme descrito",
                "( ) Sim ( ) Não": "(x) Sim ( ) Não" if "parada" in history_text.lower() else "( ) Sim (x) Não",
            }
            
            for old, new in replacements.items():
                report_markdown = report_markdown.replace(old, new, 1)
        
        # 8. Pós-processamento: garantir preenchimento de todos os campos obrigatórios
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
        # calcular url imediatamente para uso posterior
        pdf_filename = os.path.basename(pdf_path)
        pdf_url = f"/reports/{pdf_filename}"

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

        # prepare extra_data merging any chain-provided data
        timeline_extra = event_data.get("extra_data", {}) or {}
        # add link to generated PDF so timeline template pode renderizá-lo
        timeline_extra["report_url"] = pdf_url

        TimelineEventService.create_event(
            event_type=event_data.get("event_type", maintenance_type_lower),
            title=event_data.get("title", "Manutenção realizada"),
            # descrição fixa para evitar vazamento do relatório completo
            description="Relatório técnico gerado",
            users_id=chat.user_id,
            conversation_history=history,
            machine_id=machine_id,
            chat_id=chat_id,
            extra_data=timeline_extra
        )

        # Se for corretiva, cria também um evento de falha para incrementar o contador
        if maintenance_type_lower == "corretiva":
            TimelineEventService.create_event(
                event_type="falha",
                title=event_data.get("title", "Falha identificada"),
                description="Falha identificada durante manutenção corretiva",
                users_id=chat.user_id,
                conversation_history=history,
                machine_id=machine_id,
                chat_id=chat_id,
                extra_data={"report_url": pdf_url}
            )

        # 10. Retorno
        return {
            "report_markdown": report_markdown,
            "pdf_path": pdf_path,
            "pdf_url": pdf_url,
            "pdf_filename": pdf_filename,
            "event": event_data
        }

