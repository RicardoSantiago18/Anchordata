# scripts/test_ai_fill_report.py
from datetime import datetime
from src.models.chat_model import Chat
from src.models.message_model import Message
from src.models.user_model import User
from database.db import db
from src.services.maintenance_flow_service import MaintenanceFlowService
from src.utils.mock_user import get_mock_user
from src.app import create_app
import uuid

# Inicializa Flask context para acessar o banco
app = create_app()
app.app_context().push()

# Criar chat
def create_chat():
    current_user = get_mock_user()
    chat = Chat(
        title=f"Chat Teste AI {datetime.now().strftime('%H:%M')}",
        user_id=current_user.id,
        is_active=True,
        mistral_chat_id=str(uuid.uuid4()),  # <<< adiciona isso
        provider="mistral",
        mode="maintenance"
    )
    db.session.add(chat)
    db.session.commit()
    print("Chat criado:", {"id": chat.id, "title": chat.title, "created_at": chat.created_at})
    return chat

# Adicionar mensagens ao chat
def send_message(chat, content, role="user"):
    message = Message(
        chat_id=chat.id,
        content=content,
        role=role,
        created_at=datetime.now()
    )
    db.session.add(message)
    db.session.commit()
    print(f"Mensagem '{role}' salva no chat {chat.id}: {content}")
    return message

if __name__ == "__main__":
    # 1️⃣ Criar chat
    chat = create_chat()

    # 2️⃣ Enviar mensagens simuladas
    send_message(chat, "Detectamos aquecimento excessivo no motor principal. Medimos 95°C no rolamento.", role="user")
    send_message(chat, "Substituímos o rolamento por um de especificação igual e reaplicamos graxa.", role="assistant")
    send_message(chat, "Foram realizados testes de aceleração e verificados valores de vibração dentro do esperado.", role="user")
    send_message(chat, "Tudo dentro dos parâmetros esperados após a intervenção.", role="assistant")

    # 3️⃣ Gerar relatório diretamente via MaintenanceFlowService
    print("\nFinalizando manutenção e gerando relatório...\n")
    result = MaintenanceFlowService.finalize_maintenance(
        chat_id=chat.id,
        machine_id=1,
        maintenance_type="corretiva"  # só para preencher o título do relatório
    )

    # 4️⃣ Mostrar relatório
    print("\n===== RELATÓRIO MARKDOWN =====\n")
    print(result["report_markdown"])