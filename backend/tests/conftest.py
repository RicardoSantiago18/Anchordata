import pytest
from src.app import create_app
from database.db import db
from src.models.user_model import User
from src.models.maquina_model import Machine
from src.models.chat_model import Chat
from src.models.message_model import Message
from datetime import datetime
import uuid

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "WTF_CSRF_ENABLED": False,
        "SECRET_KEY": "teste123"
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client(use_cookies=True)

@pytest.fixture
def test_user(app):
    email = f"teste-{uuid.uuid4()}@teste.com"
    user = User(email=email, name="Tester")
    user.set_password("123456")
    db.session.add(user)
    db.session.commit()  # garante user.id
    return user

@pytest.fixture
def test_machine(app):
    nome_unico = f"Máquina Teste {uuid.uuid4()}"
    machine = Machine(
        nome_maquina=nome_unico,
        num_serie=f"SN{uuid.uuid4().hex[:6]}",
        data_fabricacao=datetime.now(),
        marca="MarcaX",
        fabricante="FabricanteY",
        setor="Produção",
        contato_fabricante="contato@fabricante.com",
        description="Descrição teste"
    )
    db.session.add(machine)
    db.session.commit()
    return machine

@pytest.fixture
def test_chat(app, test_user):
    chat = Chat(
        mistral_chat_id=f"chat-{uuid.uuid4()}",
        user_id=test_user.id,
        title="Chat Teste"
    )
    db.session.add(chat)
    db.session.commit()
    return chat

@pytest.fixture
def test_messages(app, test_chat):
    messages = [
        Message(chat_id=test_chat.id, role="user", content="Problema na máquina"),
        Message(chat_id=test_chat.id, role="assistant", content="Diagnosticado o problema")
    ]
    db.session.add_all(messages)
    db.session.commit()
    return messages

@pytest.fixture
def logged_in_client(client, test_user, app):
    """Cliente de teste com usuário logado."""
    with client.session_transaction() as sess:
        sess["_user_id"] = str(test_user.id)  # Flask-Login usa _user_id
    yield client

@pytest.fixture(autouse=True)
def clean_db(app):
    """Limpa o banco antes de cada teste."""
    for table in reversed(db.metadata.sorted_tables):
        db.session.execute(table.delete())
    db.session.commit()
    yield
    db.session.rollback()
