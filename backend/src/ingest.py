import os
import shutil

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

VECTOR_BASE_DIR = "data/vectorstore"


def _get_machine_vector_dir(machine_id: int) -> str:
    """Return the vectorstore directory for a specific machine."""
    return os.path.join(VECTOR_BASE_DIR, str(machine_id))


def _get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


def _extract_with_pdfplumber(pdf_path: str) -> list:
    """
    Fallback de extração usando pdfplumber.
    Melhor que PyPDFLoader em PDFs com layouts complexos.
    Requer: pip install pdfplumber
    """
    try:
        import pdfplumber
    except ImportError:
        print("[WARN] pdfplumber não instalado. Execute: pip install pdfplumber")
        return []

    docs = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                docs.append(Document(
                    page_content=text.strip(),
                    metadata={"source": pdf_path, "page": i + 1}
                ))

    print(f"[pdfplumber] {len(docs)} páginas com texto extraídas de {pdf_path}")
    return docs


def _extract_with_pymupdf(pdf_path: str) -> list:
    """
    Segundo fallback usando pymupdf (fitz).
    Mais agressivo — lida bem com textos em camadas e anotações.
    Requer: pip install pymupdf
    """
    try:
        import fitz
    except ImportError:
        print("[WARN] pymupdf não instalado. Execute: pip install pymupdf")
        return []

    docs = []
    pdf_document = fitz.open(pdf_path)

    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        text = page.get_text().strip()
        if text:
            docs.append(Document(
                page_content=text,
                metadata={"source": pdf_path, "page": page_num + 1}
            ))

    pdf_document.close()
    print(f"[pymupdf] {len(docs)} páginas com texto extraídas de {pdf_path}")
    return docs


def add_pdf_to_vectorstore(pdf_path: str, machine_id: int, filename: str | None = None):
    """
    Adiciona um PDF ao vectorstore da máquina.

    Cadeia de extração (para no primeiro que retornar conteúdo):
      1. PyPDFLoader  — extração padrão LangChain
      2. pdfplumber   — melhor em layouts complexos (pip install pdfplumber)
      3. pymupdf      — mais agressivo, lida com camadas e anotações (pip install pymupdf)

    Se nenhum extrair texto (PDF 100% baseado em imagem sem camada de texto),
    a indexação é ignorada com aviso — sem crash.
    """
    # 1. PyPDFLoader
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    documents = [doc for doc in documents if doc.page_content.strip()]

    # 2. pdfplumber
    if not documents:
        print(f"[INFO] PyPDFLoader sem texto, tentando pdfplumber: {pdf_path}")
        documents = _extract_with_pdfplumber(pdf_path)

    # 3. pymupdf
    if not documents:
        print(f"[INFO] pdfplumber sem texto, tentando pymupdf: {pdf_path}")
        documents = _extract_with_pymupdf(pdf_path)

    if not documents:
        print(
            f"[WARN] Nenhum texto extraível em {pdf_path}.\n"
            f"       O PDF parece ser 100% baseado em imagens sem camada de texto.\n"
            f"       Apenas os metadados da máquina estarão disponíveis no RAG."
        )
        return

    # Chunking
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(documents)

    if not chunks:
        print(f"[WARN] Nenhum chunk gerado para {pdf_path}. Indexação ignorada.")
        return

    # Attach metadata
    for c in chunks:
        c.metadata = c.metadata or {}
        c.metadata.update({"machine_id": str(machine_id)})
        if filename:
            c.metadata["source_file"] = filename

    embeddings = _get_embeddings()
    vector_dir = _get_machine_vector_dir(machine_id)

    try:
        db = FAISS.load_local(
            vector_dir,
            embeddings,
            allow_dangerous_deserialization=True
        )
        db.add_documents(chunks)
    except Exception:
        db = FAISS.from_documents(chunks, embeddings)

    os.makedirs(vector_dir, exist_ok=True)
    db.save_local(vector_dir)
    print(f"[OK] {pdf_path} adicionado ao vectorstore da máquina {machine_id} ({len(chunks)} chunks)")


def index_machine_to_rag(machine):
    """Index machine metadata (and manual PDF if present) into a per-machine vectorstore.

    Args:
        machine: a Machine ORM instance with fields like nome_maquina, marca, etc.
    """
    text_parts = [
        f"Nome da Máquina: {machine.nome_maquina}",
        f"Número de Série: {machine.num_serie}",
        f"Marca: {machine.marca}",
        f"Fabricante: {machine.fabricante}",
        f"Setor: {machine.setor}",
        f"Descrição: {machine.description}",
        f"Status: {machine.status}",
    ]
    if hasattr(machine, 'contato_fabricante') and machine.contato_fabricante:
        text_parts.append(f"Contato do Fabricante: {machine.contato_fabricante}")
    if hasattr(machine, 'data_fabricacao') and machine.data_fabricacao:
        text_parts.append(f"Data de Fabricação: {machine.data_fabricacao.isoformat()}")

    metadata_text = "\n".join(text_parts)

    doc = Document(
        page_content=metadata_text,
        metadata={
            "machine_id": str(machine.id),
            "source_file": "machine_metadata",
        },
    )

    embeddings = _get_embeddings()
    vector_dir = _get_machine_vector_dir(machine.id)

    try:
        db = FAISS.load_local(
            vector_dir,
            embeddings,
            allow_dangerous_deserialization=True
        )
        db.add_documents([doc])
    except Exception:
        db = FAISS.from_documents([doc], embeddings)

    os.makedirs(vector_dir, exist_ok=True)
    db.save_local(vector_dir)
    print(f"Metadados da máquina {machine.id} ({machine.nome_maquina}) indexados no vectorstore")

    # Indexar o manual PDF se existir
    if machine.manual:
        backend_root = os.path.dirname(os.path.dirname(__file__))
        manual_abs = os.path.join(backend_root, machine.manual)
        if os.path.exists(manual_abs):
            add_pdf_to_vectorstore(manual_abs, machine.id, os.path.basename(machine.manual))
        else:
            print(f"[WARN] Manual não encontrado em: {manual_abs}")


def remove_machine_from_rag(machine_id: int):
    """Remove the entire per-machine vectorstore directory."""
    vector_dir = _get_machine_vector_dir(machine_id)
    if os.path.exists(vector_dir):
        shutil.rmtree(vector_dir)
        print(f"Vectorstore da máquina {machine_id} removido")
    else:
        print(f"Vectorstore da máquina {machine_id} não existia")


if __name__ == "__main__":
    print("Use scripts/migrate_vectorstores.py para reindexar as máquinas existentes.")
