#!/usr/bin/env python
"""Test RAG with contextually relevant questions"""
import sys, os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from src.rag_chain import create_chain

rag_chain, _, _ = create_chain('rag_test.txt')

# Test queries that match the documents in vectorstore
test_cases = [
    (1, "refrigeração", "Should return Elgin AC manual content"),
    (2, "torno", "Should return lathe manual content"),
    (3, "torno", "Should return nothing (no docs for machine 3)"),
]

print("=== Testing RAG with relevant queries ===\n")
for machine_id, question, description in test_cases:
    print(f"Machine {machine_id} | Query: '{question}'")
    print(f"Expectation: {description}")
    res = rag_chain.invoke({'question': question, 'history': [], 'machine_id': machine_id})
    print(f"Response: {res[:300]}...\n")
