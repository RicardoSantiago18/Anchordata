from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from src.llm import load_llm

def create_report_chain():
    llm = load_llm()

    prompt = ChatPromptTemplate.from_template(
        """
        {system_prompt}

        ────────────────────────────────────
        TIPO DE MANUTENÇÃO:
        {maintenance_type}

        ────────────────────────────────────
        RESUMO TÉCNICO DA MANUTENÇÃO:
        {summary}

        ────────────────────────────────────
        HISTÓRICO DA CONVERSA:
        {history}

        ────────────────────────────────────
        MODELO MARKDOWN:
        {template_markdown}
        """
    )

    chain = prompt | llm | StrOutputParser()
    return chain