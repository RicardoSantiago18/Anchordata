# src/services/ai/ai_service.py

from app.rag_chain import create_chain

class AIService:
    def __init__(self):
        self.rag_chain, self.web_search, self.llm = create_chain()

    def send_message(
            self,
            question,
            maintenance_mode: str,
            history: list[tuple[str, str]]
    ) -> str:
        """
        Envia uma mensagem para a IA e retorna a resposta.
        
        :param self: Description
        :param question: Description
        :param maintenance_mode: Description
        :type maintenance_mode: str
        :param history: Description
        :type history: list[tuple[str, str]]
        :return: Description
        :rtype: str
        """

        # converte histórico para string
        history_str = "/n".join(
            [f"User: {h[0]}/nAI: {h[1]}" for h in history[-3:]]
        )

        input_data = {
            "question": question,
            "maintenance_mode": maintenance_mode,
            "history": history_str
        }

        answer = self.rag_chain.invoke(input_data)
        return answer