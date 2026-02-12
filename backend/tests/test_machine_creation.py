import pytest
from src.models.user_model import User, UserRole
from database.db import db
import io
import json

def test_create_machine_as_admin(client, app):
    # Create admin user
    with app.app_context():
        # Check if admin exists from init_db (it won't because test uses in-memory db from conftest)
        admin = User(
            email="admin_test@test.com",
            name="Admin Test",
            role=UserRole.ADMIN.value
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()

    # Login
    login_resp = client.post("/api/auth/login", json={
        "email": "admin_test@test.com",
        "password": "admin123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json["token"]

    # Create Machine Data
    data = {
        "nome_maquina": "Nova Máquina Teste",
        "num_serie": "SN123456",
        "data_fabricacao": "2023-01-01",
        "marca": "Marca Teste",
        "fabricante": "Fabricante Teste",
        "setor": "Setor Teste",
        "contato_fabricante": "Contato Teste",
        "description": "Descrição Teste"
    }
    
    # Prepare multipart/form-data
    # We need to send data as form fields
    
    # Construct multipart data
    multipart_data = {}
    for key, value in data.items():
        multipart_data[key] = value
    
    # Files
    multipart_data["imagem"] = (io.BytesIO(b"fake image data"), "image.jpg")
    multipart_data["manual"] = (io.BytesIO(b"fake manual data"), "manual.pdf")

    # Request
    resp = client.post(
        "/api/machines", 
        data=multipart_data, 
        headers={"Authorization": f"Bearer {token}"},
        content_type="multipart/form-data"
    )

    if resp.status_code != 201:
        print(resp.get_json())

    assert resp.status_code == 201
    resp_json = resp.get_json()
    assert resp_json["nome_maquina"] == "Nova Máquina Teste"
    assert "imagem" in resp_json
    assert "manual" in resp_json
    # Check if paths are non-empty
    assert resp_json["imagem"]
    assert resp_json["manual"]
