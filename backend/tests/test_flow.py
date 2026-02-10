import pytest
from unittest.mock import patch
from tests.conftest import logged_in_client
from src.models.chat_model import Chat
from src.models.message_model import Message
from src.models.maquina_model import Machine
from datetime import datetime
from database.db import db

@patch("src.services.maintenance_flow_service.PDFService.generate_pdf_from_markdown")
def test_finalize_maintenance_endpoint(mock_generate_pdf, client, test_user):
    mock_generate_pdf.return_value = b"%PDF-1.4 Fake PDF"

    # Criar Machine de teste
    machine = Machine(
        nome_maquina="Máquina Teste",
        num_serie="123456",
        data_fabricacao=datetime(2020, 1, 1),
        marca="Marca",
        fabricante="Fabricante",
        setor="Setor",
        contato_fabricante="contato@fabricante.com",
        description="Máquina de teste"
    )
    db.session.add(machine)
    db.session.commit()

    # Criar chat de teste
    chat = Chat(
        mistral_chat_id="chat-teste",
        user_id=test_user.id,
        title="Chat Teste",
        is_active=True
    )
    db.session.add(chat)
    db.session.commit()

    # Criar mensagens
    msg1 = Message(chat_id=chat.id, role="user", content="Problema na máquina")
    msg2 = Message(chat_id=chat.id, role="assistant", content="Diagnosticado o problema")
    db.session.add_all([msg1, msg2])
    db.session.commit()

    payload = {
        "chat_id": chat.id,
        "machine_id": machine.id,
        "maintenance_type": "corretiva"
    }

    response = logged_in_client.post("/maintenance/finalize", json=payload)
    print(response.data.decode())
    assert response.status_code == 200
