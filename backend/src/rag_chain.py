from dotenv import load_dotenv
from langchain_core.runnables import RunnableLambda
from operator import itemgetter  # <--- Importação necessária para corrigir o erro

from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser

from src.llm import load_llm
from src.utils.prompt_loader import load_system_prompt

VECTOR_DIR = "data/vectorstore"

load_dotenv()


def format_history(history):
    if not history:
        return "Nenhum histórico disponível."
    
    return "\n".join(
        f"Usuário: {user}\nAssistente: {assistant}"
        for user, assistant in history
    )


def create_chain(prompt_name: str):
    llm = load_llm()

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vector_db = FAISS.load_local(
        VECTOR_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )

    retriever = vector_db.as_retriever(search_kwargs={"k": 4})

    system_prompt_text = load_system_prompt(prompt_name)
    prompt = ChatPromptTemplate.from_template(system_prompt_text)

    def format_docs(docs):
        if not docs:
            return "Nenhum contexto técnico relevante encontrado."
        return "\n\n".join(doc.page_content for doc in docs)

    # Usamos itemgetter para pegar apenas os campos específicos do dicionário de entrada
    rag_chain = (
        {
            "context": (
                RunnableLambda(itemgetter("question"))
                | retriever
                | RunnableLambda(format_docs)
            ),
            "question": RunnableLambda(itemgetter("question")),
            "history": RunnableLambda(
                lambda x: format_history(x["history"])
            ),
            "draft_report": RunnableLambda(
                lambda x: x.get("draft_report", "")
            )
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain, None, llm