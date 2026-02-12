# src/services/ai/ai_service.py

from src.rag_chain import create_chain


class AIService:

    def send_message(
        self,
        *,
        question: str,
        history: list[tuple[str, str]],
        mode: str,
        draft_report: str | None = None,
    ) -> dict:
        """
        question: pergunta do usuário
        history: histórico da conversa
        mode: "maintenance" ou "report"
        draft_report: rascunho atual do relatório (opcional)
        """

        # 🔁 Escolha dinâmica do prompt
        if mode == "maintenance":
            prompt_file = "maintenance_assistant.txt"
        elif mode == "report":
            prompt_file = "report_generator.txt"
        else:
            prompt_file = "maintenance_assistant.txt"

        try:
            print(">>> IA: entrou no send_message")
            print("Modo:", mode)
            print("Pergunta:", question)

            # Cria chain dinamicamente com prompt correto
            rag_chain, _, _ = create_chain(prompt_file)

            resposta = rag_chain.invoke({
                "question": question,
                "history": history,
                "draft_report": draft_report or ""
            })

            updated_draft = (draft_report or "") + "\n" + resposta

            return {
                "user_facing_text": resposta,
                "draft_report": updated_draft
            }

        except Exception as e:
            print("Erro ao chamar IA:", e)
            return {
                "user_facing_text": "Desculpe, ocorreu um erro ao processar sua solicitação.",
                "draft_report": draft_report
            }


ai_service = AIService()
