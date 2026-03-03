import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from pathlib import Path

PDF_DIR = "data/pdfs"
VECTOR_DIR = "data/vectorstore"

def ingest_pdfs():
    documents = []

    for file in os.listdir(PDF_DIR):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(PDF_DIR, file))
            documents.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    db = FAISS.from_documents(chunks, embeddings)
    db.save_local(VECTOR_DIR)

    print("PDFs indexados com sucesso!")


def add_pdf_to_vectorstore(pdf_path: str, machine_id: int, filename: str | None = None):
    """Add a single PDF to the existing vectorstore, tagging chunks with machine_id."""
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(documents)

    # attach metadata so we can filter later
    for c in chunks:
        c.metadata = c.metadata or {}
        c.metadata.update({"machine_id": str(machine_id)})
        if filename:
            c.metadata["source_file"] = filename

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # load existing index if present, otherwise create new
    try:
        db = FAISS.load_local(
            VECTOR_DIR,
            embeddings,
            allow_dangerous_deserialization=True
        )
        db.add_documents(chunks)
    except Exception:
        db = FAISS.from_documents(chunks, embeddings)

    db.save_local(VECTOR_DIR)
    print(f"Documento {pdf_path} adicionado ao vectorstore com machine_id={machine_id}")


if __name__ == "__main__":
    ingest_pdfs()
