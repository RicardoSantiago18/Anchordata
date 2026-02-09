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

        ────────────────────────────────────
        SAÍDA OBRIGATÓRIA (JSON PURO):
        {{
            "event_type": "preventiva | corretiva",
            "title": "string",
            "description": "string",
            "extra_data": {{}}
        }}

        Regras:
        - Retorne APENAS o JSON
        - Não use markdown
        - Não escreva textp fora do JSON
        """
    )
     
     chain = prompt | llm | JsonOutputParser()
     return chain