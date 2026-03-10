#!/usr/bin/env python
"""Migrate existing machines to per-machine vectorstores.

Run from the backend directory with the venv active:
    python scripts/migrate_vectorstores.py
"""
import sys
import os
import shutil

sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from src.app import create_app
from src.models.maquina_model import Machine
from src.ingest import index_machine_to_rag

app = create_app()


def migrate():
    with app.app_context():
        machines = Machine.query.all()

        if not machines:
            print("Nenhuma máquina encontrada no banco de dados.")
            return

        print(f"Encontradas {len(machines)} máquinas para reindexar.\n")

        for machine in machines:
            print(f"--- Indexando máquina {machine.id}: {machine.nome_maquina} ---")
            try:
                index_machine_to_rag(machine)
                print(f"  ✅ Máquina {machine.id} indexada com sucesso\n")
            except Exception as e:
                print(f"  ❌ Erro ao indexar máquina {machine.id}: {e}\n")

        # Optionally remove old shared vectorstore files (index.faiss / index.pkl)
        old_index = os.path.join("data", "vectorstore", "index.faiss")
        old_pkl = os.path.join("data", "vectorstore", "index.pkl")
        if os.path.exists(old_index):
            os.remove(old_index)
            print("Removido vectorstore compartilhado antigo: index.faiss")
        if os.path.exists(old_pkl):
            os.remove(old_pkl)
            print("Removido vectorstore compartilhado antigo: index.pkl")

        print("\n✅ Migração concluída!")


if __name__ == "__main__":
    migrate()
