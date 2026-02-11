# src/services/ai/ai_service.py

from src.rag_chain import create_chain

class AIService:
    def __init__(self):
        self.rag_chain, self.web_search, self.llm = create_chain()

    def send_message(
        self,
        question: str,
        history: list[tuple[str, str]],
        draft_report: str = None,
        mode: str = "collect_info"
    ) -> dict:
        """
        question: pergunta do usuário
        history: histórico da conversa
        draft_report: relatório técnico em andamento (pode ser None)
        mode: "collect_info" ou "finalize" (define comportamento da IA)
        """

        MAX_DRAFT_CHARS = 2000

        if draft_report is None:
            draft_report = ""
        else:
            draft_report = draft_report[-MAX_DRAFT_CHARS:]

        try:
            print(">>> IA: entrou no send_message")
            print("Pergunta:", question)
            print("History:", history)
            print("Draft report atual:", draft_report)
            print("Modo:", mode)

            # Chamada ao RAG Chain
            resposta = self.rag_chain.invoke({
                "question": question,
                "history": history,
                "draft_report": draft_report,
                "mode": mode
            })

            # Simula atualização do draft_report
            updated_draft = draft_report + "\n" + str(resposta)

            # Texto que será mostrado ao usuário
            user_facing_text = str(resposta) if mode != "finalize" else "Relatório final gerado."

            return {
                "user_facing_text": user_facing_text,
                "draft_report": updated_draft
            }

        except Exception as e:
            print("Erro ao chamar IA:", e)
            return {
                "user_facing_text": "Desculpe, ocorreu um erro ao processar sua solicitação.",
                "draft_report": draft_report
            }


ai_service = AIService()
