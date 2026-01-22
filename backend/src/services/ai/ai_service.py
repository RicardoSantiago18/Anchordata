# src/services/ai/ai_service.py

from src.rag_chain import create_chain

class AIService:
    def __init__(self):
        self.rag_chain, self.web_search, self.llm = create_chain()

    def send_message(self, question: str, maintenance_mode: str, history: list[tuple[str, str]]) -> str:
        # Chama IA com pergunta

        print(">>> IA: entrou no send_message")
        print("Pergunta:", question)
        print("Modo:", maintenance_mode)
        print("History:", history)

        resposta = self.rag_chain.invoke({
            "question": question,
            "maintenance_mode": maintenance_mode,
            "history": history
        })
 
        print(">>> IA Respondeu: ", resposta)

        if hasattr(resposta, "content"):
            return resposta.content
        
        return resposta
    
ai_service = AIService()