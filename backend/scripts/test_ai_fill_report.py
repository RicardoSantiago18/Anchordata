# -*- coding: utf-8 -*-
"""
Roda um teste end-to-end via backend-only (HTTP):
1) Cria um chat
2) Envia mensagens t�cnicas para popular draft_report
3) Finaliza a manuten��o com machine_id=1 e imprime 
eport_markdown

Uso:
  . venv\\Scripts\\Activate.ps1
  pip install requests
  python scripts\\test_ai_fill_report.py

Observa��es:
- Backend deve estar rodando em http://127.0.0.1:5000
- LLM deve estar dispon�vel conforme src/llm.py
- Machine mock deve existir (machine_id=1 neste exemplo)
"""

import requests
import time

API_BASE = "http://127.0.0.1:5000/api"
MACHINE_ID = 2


def create_chat():
    resp = requests.post(f"{API_BASE}/chats", json={"title": "Chat Teste AI"})
    resp.raise_for_status()
    return resp.json()


def send_message(chat_id, content, finalize=False, machine_id=None, maintenance_type=None):
    payload = {"content": content}
    if finalize:
        payload.update({"finalize": True, "machine_id": machine_id, "maintenance_type": maintenance_type})
    resp = requests.post(f"{API_BASE}/chats/{chat_id}/messages", json=payload)
    resp.raise_for_status()
    return resp.json()


if __name__ == '__main__':
    print("Criando chat...")
    chat = create_chat()
    chat_id = chat.get("id")
    print("Chat criado:", chat)

    print("Enviando mensagem t�cnica (gera draft_report)...")
    msg1 = (
        "Detectamos aquecimento excessivo no motor principal. Medimos 95�C no rolamento. "
        "Substitu�mos o rolamento por um de especifica��o igual e reaplicamos graxa.")
    r1 = send_message(chat_id, msg1)
    print("Resposta IA (1):", r1)

    time.sleep(1)

    print("Enviando segunda mensagem t�cnica para adicionar detalhes...")
    msg2 = "Foram realizados testes de acelera��o e verificados valores de vibra��o dentro do esperado ap�s interven��o."
    r2 = send_message(chat_id, msg2)
    print("Resposta IA (2):", r2)

    time.sleep(1)

    print("Finalizando manuten��o (gerar relat�rio) via endpoint de mensagens...")
    result = send_message(chat_id, "finalizada", finalize=True, machine_id=MACHINE_ID, maintenance_type="corretiva")

    print("\n===== REPORT_MARKDOWN =====\n")
    print(result.get("report_markdown"))
    print("\n===== PDF PATH =====\n")
    print(result.get("pdf_path"))
    with open("report_result.md", "w", encoding="utf-8") as f:
        f.write(result.get("report_markdown") or "")
    print("Relat�rio salvo em report_result.md")
