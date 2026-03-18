from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from src.llm import load_llm
from src.utils.prompt_loader import load_system_prompt


VALID_STATUSES = {"Estado Saudável", "Atenção", "Estado Crítico"}


def create_status_chain():
    """Creates a LangChain chain that classifies machine status from conversation."""
    llm = load_llm()

    system_prompt_text = load_system_prompt("status_classifier.txt")
    prompt = ChatPromptTemplate.from_template(system_prompt_text)

    chain = prompt | llm | JsonOutputParser()
    return chain


def classify_machine_status(
    *,
    ai_response: str,
    user_message: str,
    maintenance_type: str,
) -> dict | None:
    """
    Classifies the machine status based on the AI conversation.

    Returns:
        dict with "status" and "justification" keys, or None on failure.
    """
    try:
        chain = create_status_chain()

        result = chain.invoke({
            "ai_response": ai_response,
            "user_message": user_message,
            "maintenance_type": maintenance_type or "manutenção",
        })

        # Validate the status value
        if isinstance(result, dict) and result.get("status") in VALID_STATUSES:
            return result

        print(f"[WARN] Status inválido retornado pela chain: {result}")
        return None

    except Exception as e:
        print(f"[WARN] Falha na classificação de status: {e}")
        return None
