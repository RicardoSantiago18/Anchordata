from langchain_core.prompts import ChatPromptTemplate
from langchain_core.prompts import SystemMessagePromptTemplate
from langchain_core.prompts import HumanMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from src.llm import load_llm
import logging

logger = logging.getLogger(__name__)

def create_report_chain():
    llm = load_llm()

    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template("{system_prompt}"),
        HumanMessagePromptTemplate.from_template("""

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
        """)
             ])

    # Wrapper para logar tamanho do prompt e truncar se necessário
    def truncate_if_needed(inputs):
        total_size = sum(len(str(v)) for v in inputs.values())
        logger.info(f"[report_chain] Tamanho total do prompt: {total_size} caracteres")
        
        # Se prompt muito grande, truncar
        if total_size > 3500:
            logger.warning(f"[report_chain] Prompt muito grande ({total_size}>3500), truncando...")
            if "summary" in inputs and len(inputs["summary"]) > 500:
                inputs["summary"] = inputs["summary"][:500] + "..."
            if "history" in inputs and len(inputs["history"]) > 500:
                inputs["history"] = inputs["history"][:500] + "..."
        
        return inputs
    
    chain = RunnableLambda(truncate_if_needed) | prompt | llm | StrOutputParser()
    return chain
