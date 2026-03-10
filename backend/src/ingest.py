import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from pathlib import Path
import shutil

VECTOR_BASE_DIR = "data/vectorstore"


def _get_machine_vector_dir(machine_id: int) -> str:
    """Return the vectorstore directory for a specific machine."""
    return os.path.join(VECTOR_BASE_DIR, str(machine_id))


def _get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


def add_pdf_to_vectorstore(pdf_path: str, machine_id: int, filename: str | None = None):
    """Add a single PDF to the machine-specific vectorstore."""
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(documents)

    # attach metadata
    for c in chunks:
        c.metadata = c.metadata or {}
        c.metadata.update({"machine_id": str(machine_id)})
        if filename:
            c.metadata["source_file"] = filename

    embeddings = _get_embeddings()
    vector_dir = _get_machine_vector_dir(machine_id)

    # load existing machine index if present, otherwise create new
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
    print(f"Documento {pdf_path} adicionado ao vectorstore da máquina {machine_id}")


def index_machine_to_rag(machine):
    """Index machine metadata (and manual PDF if present) into a per-machine vectorstore.

    Args:
        machine: a Machine ORM instance with fields like nome_maquina, marca, etc.
    """
    # Build a rich text document from the machine's structured fields
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

    # Create or update the machine's vectorstore
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

    # Also index the manual PDF if one exists
    if machine.manual:
        # manual is stored as a relative path like "data/machines/<id>/<filename>"
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
