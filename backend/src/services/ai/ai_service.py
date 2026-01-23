# src/services/ai/ai_service.py

from src.rag_chain import create_chain

class AIService:
    def __init__(self):
        self.rag_chain, self.web_search, self.llm = create_chain()

    def send_message(self, question: str, history: list[tuple[str, str]]) -> str:
        # Chama IA com pergunta
        try:
            print(">>> IA: entrou no send_message")
            print("Pergunta:", question)
            print("History:", history)

            resposta = self.rag_chain.invoke({
                "question": question,
                "history": history
            })
 
            print(">>> IA Respondeu: ", resposta)

            if hasattr(resposta, "content"):
                return resposta.content
        
            return resposta
        except Exception as e:
            print("Erro ao chamar IA:", e)
            return "Desculpe, ocorreu um erro ao processar sua solicitação."
    
ai_service = AIService()