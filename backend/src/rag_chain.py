from dotenv import load_dotenv
from langchain_core.runnables import RunnableLambda
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser

from src.llm import load_llm
from src.utils.prompt_loader import load_system_prompt

import os

VECTOR_BASE_DIR = "data/vectorstore"

load_dotenv()


def format_history(history):
    if not history:
        return "Nenhum histórico disponível."
    
    return "\n".join(
        f"Usuário: {user}\nAssistente: {assistant}"
        for user, assistant in history
    )


def create_chain(prompt_name: str, machine_id: int = None):
    llm = load_llm()

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # Load machine-specific vectorstore if machine_id is provided
    retriever = None
    if machine_id is not None:
        vector_dir = os.path.join(VECTOR_BASE_DIR, str(machine_id))
        if os.path.exists(vector_dir):
            try:
                vector_db = FAISS.load_local(
                    vector_dir,
                    embeddings,
                    allow_dangerous_deserialization=True
                )
                retriever = vector_db.as_retriever(search_kwargs={"k": 4})
            except Exception as e:
                print(f"[WARN] Falha ao carregar vectorstore da máquina {machine_id}: {e}")
    else:
        # Fallback: try to load a global vectorstore (backward compatibility)
        if os.path.exists(VECTOR_BASE_DIR) and os.path.isfile(os.path.join(VECTOR_BASE_DIR, "index.faiss")):
            try:
                vector_db = FAISS.load_local(
                    VECTOR_BASE_DIR,
                    embeddings,
                    allow_dangerous_deserialization=True
                )
                retriever = vector_db.as_retriever(search_kwargs={"k": 4})
            except Exception:
                pass

    system_prompt_text = load_system_prompt(prompt_name)
    prompt = ChatPromptTemplate.from_template(system_prompt_text)

    def format_docs(docs):
        if not docs:
            return "Nenhum contexto técnico relevante encontrado."
        return "\n\n".join(doc.page_content for doc in docs)

    def retrieve_and_format(inputs):
        """Retrieves docs from machine-specific vectorstore."""
        question = inputs.get("question")
        if retriever is None:
            return "Nenhum contexto técnico disponível para esta máquina."
        docs = retriever.invoke(question)
        return format_docs(docs)

    rag_chain = (
        {
            "context": RunnableLambda(retrieve_and_format),
            "question": RunnableLambda(itemgetter("question")),
            "history": RunnableLambda(
                lambda x: format_history(x["history"])),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain, None, llm