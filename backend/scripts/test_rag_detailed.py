#!/usr/bin/env python
"""Test script to validate RAG filtering by machine_id"""
import sys, os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from src.rag_chain import create_chain
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# Load vectorstore to check what's indexed
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = FAISS.load_local(
    "data/vectorstore",
    embeddings,
    allow_dangerous_deserialization=True
)

# Search for "impressora" (printer) which should be in machine 1's manual
print("=== Searching for 'impressora' (without filter) ===")
raw_docs = vector_db.similarity_search("impressora", k=4)
for i, doc in enumerate(raw_docs):
    mid = doc.metadata.get("machine_id", "?")
    print(f"Doc {i}: machine_id={mid}, source={doc.metadata.get('source', '?')}")
    print(f"  Content: {doc.page_content[:100]}...\n")

print("\n=== Now testing RAG chain filtering ===")
rag_chain, _, _ = create_chain('rag_test.txt')

for mid in [1, 2, 3]:
    print(f"\n--- Testing machine_id {mid} ---")
    res = rag_chain.invoke({'question': 'impressora', 'history': [], 'machine_id': mid})
    print(f"Response: {res[:200]}...")
