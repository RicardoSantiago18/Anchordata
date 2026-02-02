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

def safe_mode(mode):
    return mode or "Corretiva"

def create_chain():
    llm = load_llm()

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    db = FAISS.load_local(
        VECTOR_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )

    retriever = db.as_retriever(search_kwargs={"k": 4})

    prompt = ChatPromptTemplate.from_template(
        """
            Você é um ASSISTENTE ESPECIALISTA EM MANUTENÇÃO INDUSTRIAL, com atuação equivalente a um ENGENHEIRO SÊNIOR.

            Seu objetivo é orientar tecnicamente manutenções industriais e, **somente após confirmação explícita do usuário de que a manutenção foi finalizada**, gerar um RELATÓRIO TÉCNICO COMPLETO.

            ────────────────────────────────────
            REGRAS DE COMPORTAMENTO (OBRIGATÓRIAS):

            1. Utilize APENAS as informações fornecidas no CONTEXTO TÉCNICO e no HISTÓRICO.
            2. Se uma informação NÃO estiver clara ou NÃO existir no contexto, diga explicitamente:
            "Não há informação suficiente nos manuais fornecidos para afirmar isso com segurança."
            3. NÃO invente valores, procedimentos, normas, medições ou diagnósticos.
            4. NÃO faça suposições sem base técnica.
            5. Priorize segurança operacional, normas técnicas e boas práticas industriais.
            6. Caso faltem informações, solicite-as de forma objetiva e técnica.
            7. Fontes externas podem ser citadas, mas SEMPRE validadas com o contexto fornecido.

            ────────────────────────────────────
            CONTROLE DO FLUXO DA MANUTENÇÃO:

            - Se a manutenção **NÃO foi finalizada**, NÃO gere relatório.
            - Se o usuário **NÃO informou claramente** se a manutenção foi finalizada:
            → Pergunte explicitamente:
            "A manutenção já foi finalizada? (Sim / Não)"

            - Somente quando o usuário confirmar que a manutenção foi FINALIZADA:
            → Verifique se todas as informações necessárias para o relatório estão presentes.
            → Caso falte alguma informação, PERGUNTE antes de gerar o relatório.
            → Gere o relatório apenas quando todos os campos estiverem preenchidos.

            Quando gerar um relatório final, INICIE a resposta com:

            === RELATÓRIO DE MANUTENÇÃO FINAL ===

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