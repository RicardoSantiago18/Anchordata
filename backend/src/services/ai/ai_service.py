# src/services/ai/ai_service.py

from src.rag_chain import create_chain


class AIService:

    def _build_maintenance_context(self, data: dict) -> str:
        """ Formata os metadados da manutenção em bloco de texto para a IA."""
        if not data:
            return ""
        
        fields = {
            "Data": data.get("date"),
            "Responsável": data.get("responsible_name"),
            "ID": data.get("maintenance_ide"),
            "Tempo de Parada": data.get("downtime"),
            "Início da Intervenção": data.get("intervention_start"),
            "Duração": data.get("duration"),
        }

        lines = [
            f"- {label}: {value}"
            for label, value in fields.items()
            if value is not None
        ]

        if not lines:
            return ""
        
        return "DADOS DA MANUTENÇÃO (fornecidos pelo sistema):\n" + "\n".join(lines)

    def send_message(
        self,
        *,
        question: str,
        history: list[tuple[str, str]],
        mode: str,
        machine_id: int = None,
        maintenance_data: dict = None,
    ) -> dict:
        """
        question: pergunta do usuário
        history: histórico da conversa
        mode: "maintenance" ou "report"
        machine_id: ID da máquina para carregar vectorstore específico
        """

        # Escolha dinâmica do prompt
        if mode == "corretiva":
            prompt_file = "maintenance_assistant_corretiva.txt"
        elif mode == "preventiva":
            prompt_file = "maintenance_assistant_preventiva.txt"
        elif mode == "maintenance":
            prompt_file = "maintenance_assistant.txt"
        elif mode == "report":
            prompt_file = "report_generator.txt"
        else:
            prompt_file = "maintenance_assistant.txt"

        try:
            print(">>> IA: entrou no send_message")
            print("Modo:", mode)
            print("Pergunta:", question)
            print("Machine ID:", machine_id)
            print("Maintenance Data:", maintenance_data)

             # Construir contexto de metdadados e prefixa na question
            maintenance_context = self._build_maintenance_context(maintenance_data)
            full_question = (
                f"{maintenance_context}\n\n{question}"
                if maintenance_context
                else question
            )

            # Cria chain com vectorstore específico da máquina
            rag_chain, _, _ = create_chain(prompt_file, machine_id=machine_id)

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
