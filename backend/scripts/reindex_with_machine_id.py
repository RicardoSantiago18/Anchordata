#!/usr/bin/env python
"""Reindex PDFs with correct machine_id metadata"""
import sys, os
import shutil
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from src.ingest import add_pdf_to_vectorstore

# Map PDF filenames to machine_id
PDF_MAP = {
    'manual_torno.pdf': [2, 3],  # Machines 2 and 3 both use this manual
    'elgin_manual_instalacao_eco_inverter.pdf': 1,  # Could be for machine 1 or generic
    # Note: impressora_manual.pdf should be copied from machines/1 if not present
}

# First, ensure impressora manual is in data/pdfs if not present
impressora_src = "data/machines/1/impressora_manual.pdf"
impressora_dest = "data/pdfs/impressora_manual.pdf"
if os.path.exists(impressora_src) and not os.path.exists(impressora_dest):
    shutil.copy(impressora_src, impressora_dest)
    print(f"Copied {impressora_src} to {impressora_dest}")

# Clear vectorstore to rebuild
vectorstore_dir = "data/vectorstore"
if os.path.exists(vectorstore_dir):
    import shutil
    shutil.rmtree(vectorstore_dir)
    print(f"Cleared {vectorstore_dir}")

# Reindex PDFs with correct machine_id
print("\nReindexing PDFs with machine_id metadata...\n")

# Add impressora (machine 1)
if os.path.exists(impressora_dest):
    add_pdf_to_vectorstore(impressora_dest, machine_id=1, filename="impressora_manual.pdf")

# Add torno manual (machines 2 and 3)
for machine_id in [2, 3]:
    torno_path = "data/pdfs/manual_torno.pdf"
    if os.path.exists(torno_path):
        add_pdf_to_vectorstore(torno_path, machine_id=machine_id, filename=f"manual_torno.pdf (machine {machine_id})")

# Add elgin AC manual (assuming for machines that might have it) - let's associate with machine 1 for now
elgin_path = "data/pdfs/elgin_manual_instalacao_eco_inverter.pdf"
if os.path.exists(elgin_path):
    # This could be a shared document, add to multiple machines or just one
    add_pdf_to_vectorstore(elgin_path, machine_id=1, filename="elgin_manual_instalacao_eco_inverter.pdf")

print("\n✅ Reindexing complete!")
