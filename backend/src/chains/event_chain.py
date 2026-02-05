from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from Anchordata.backend.src import llm
from src.llm import load_llm


def create_event_chain():
     llm = load_llm()
     
     prompt = ChatPromptTemplate.from_template(
        """
        {system_prompt}

        ────────────────────────────────────
        TIPO DE MANUTENÇÃO:
        {maintenance_type}

        ────────────────────────────────────
        RESUMO TÉCNICO:
        {summary}

        ────────────────────────────────────
        HISTÓRICO DA CONVERSA:
        {history}
        """
    )
     
     chain = prompt | llm | JsonOutputParser()
     return chain