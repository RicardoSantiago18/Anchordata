from dotenv import load_dotenv
from langchain_core.runnables import RunnableLambda
from operator import itemgetter  # <--- Importação necessária para corrigir o erro

from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser

from src.llm import load_llm

VECTOR_DIR = "data/vectorstore"

load_dotenv()


def format_history(history):
    if not history:
        return "Nenhum histórico disponível."
    
    return "\n".join(
        f"Usuário: {user}\nAssistente: {assistant}"
        for user, assistant in history
    )


def create_chain():
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

    prompt = ChatPromptTemplate.from_template(
        """
            Você é um ASSISTENTE ESPECIALISTA EM MANUTENÇÃO INDUSTRIAL, com atuação equivalente a um ENGENHEIRO SÊNIOR.

            Seu objetivo é orientar tecnicamente manutenções industriais, fornecendo instruções detalhadas, seguras e precisas.

            ────────────────────────────────────
            REGRAS DE COMPORTAMENTO (OBRIGATÓRIAS):

            1. Pergunte ao usuário sobre o TIPO DE MANUTENÇÃO (Corretiva ou Preventiva) no início da conversa.
            2. Utilize APENAS as informações fornecidas no CONTEXTO TÉCNICO e no HISTÓRICO.
            3. Se uma informação NÃO estiver clara ou NÃO existir no contexto, diga explicitamente:
            "Não há informação suficiente nos manuais fornecidos para afirmar isso com segurança."
            4. NÃO invente valores, procedimentos, normas, medições ou diagnósticos.
            5. NÃO faça suposições sem base técnica.
            6. Priorize segurança operacional, normas técnicas e boas práticas industriais.
            7. Caso faltem informações, solicite-as de forma objetiva e técnica.
            8. Fontes externas podem ser citadas, mas SEMPRE validadas com o contexto fornecido.
            9. NÃO utilize fontes externas como base principal sem confirmação explícita no contexto técnico.


            ────────────────────────────────────
            CONTROLE DO FLUXO DA MANUTENÇÃO:

            - Se a manutenção **NÃO foi finalizada**, NÃO passe para o modo de geração de relatório técnico.
            - Se o usuário **NÃO informou claramente** se a manutenção foi finalizada:
            → Pergunte explicitamente:
            "A manutenção já foi finalizada? (Sim / Não)"

            - Ao confirmar a finalização da manutenção, informe que o relatório será gerado em uma ETAPA SEPARADA.
            - NÃO gere o relatório neste modo.

            Quando for responder, considere:

            ────────────────────────────────────
            HISTÓRICO DA CONVERSA:
            {history}

            ────────────────────────────────────
            CONTEXTO TÉCNICO (MANUAIS, DOCUMENTAÇÃO E BASE DE CONHECIMENTO):
            {context}

            ────────────────────────────────────
            PERGUNTA ATUAL DO TÉCNICO / ENGENHEIRO:
            {question}

            ────────────────────────────────────
            FORMATO OBRIGATÓRIO DA RESPOSTA:

            1. ANÁLISE TÉCNICA INICIAL  
            Explique brevemente o problema ou solicitação com base no contexto disponível.

            2. PASSO A PASSO TÉCNICO  
            Forneça instruções claras, numeradas e objetivas, seguindo boas práticas de manutenção industrial.

            3. PONTOS DE ATENÇÃO E SEGURANÇA  
            Liste riscos, cuidados, EPIs e verificações críticas.

            4. POSSÍVEIS CAUSAS (SE APLICÁVEL)  
            Aponte causas prováveis APENAS se houver base técnica no contexto.

            5. DICAS PRÁTICAS DE ENGENHARIA  
            Inclua recomendações úteis baseadas em experiência de campo.

            6. FONTES E REFERÊNCIAS  
            Liste manuais, normas, fabricantes, sites técnicos ou vídeos.
            Se não houver link direto, informe o NOME DA FONTE e onde encontrá-la.

            ⚠️ Se o CONTEXTO não for suficiente para responder com segurança, interrompa a resposta após o item 1 e explique a limitação.

            RESPOSTA TÉCNICA:
    """

    #Depois adicionar o seguinte para o prompt:
    #TIPO DE MANUTENÇÃO:
    #{maintenance_mode}
    #(Pode ser: Corretiva, Corretiva Programada ou Preventiva)

    )

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # --- CORREÇÃO AQUI ---
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
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain, None, llm