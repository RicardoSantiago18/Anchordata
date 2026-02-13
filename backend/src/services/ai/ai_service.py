# src/services/ai/ai_service.py

from src.rag_chain import create_chain


class AIService:

    def send_message(
        self,
        *,
        question: str,
        history: list[tuple[str, str]],
        mode: str,
    ) -> dict:
        """
        question: pergunta do usuário
        history: histórico da conversa
        mode: "maintenance" ou "report"
        """

        # Escolha dinâmica do prompt
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
                "history": history
            })

            return {
                "user_facing_text": resposta
            }

        except Exception as e:
            print("Erro ao chamar IA:", e)
            return {
                "user_facing_text": "Desculpe, ocorreu um erro ao processar sua solicitação."
            }


ai_service = AIService()
