import pytest
import io
from src.models.user_model import User, UserRole
from database.db import db

def test_get_machine_details_and_file(client, app):
    # Setup: Create Admin User and Login
    with app.app_context():
        admin = User(email="admin_details@test.com", name="Admin", role=UserRole.ADMIN.value)
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()

    login_resp = client.post("/api/auth/login", json={"email": "admin_details@test.com", "password": "admin123"})
    token = login_resp.json["token"]

    # Setup: Create Machine with Image
    data = {
        "nome_maquina": "Detalhes Máquina",
        "num_serie": "SN-DET-001",
        "data_fabricacao": "2023-05-20",
        "marca": "BrandX",
        "fabricante": "FabY",
        "setor": "SetorZ",
        "contato_fabricante": "Contato",
        "description": "Desc"
    }
    multipart_data = {k: v for k, v in data.items()}
    multipart_data["imagem"] = (io.BytesIO(b"fake image data"), "image_det.png")

    create_resp = client.post(
        "/api/machines", 
        data=multipart_data, 
        headers={"Authorization": f"Bearer {token}"},
        content_type="multipart/form-data"
    )
    assert create_resp.status_code == 201
    machine_id = create_resp.json["id"]
    image_path = create_resp.json["imagem"]

    # Test 1: Get Machine Details (Public)
    get_resp = client.get(f"/api/machines/{machine_id}")
    assert get_resp.status_code == 200
    assert get_resp.json["nome_maquina"] == "Detalhes Máquina"
    assert get_resp.json["imagem"] == image_path

    # Test 2: Get Machine File (Public)
    # The route is /api/machines/files/<path:filename>
    
    file_resp = client.get(f"/api/machines/files/{image_path}")
    assert file_resp.status_code == 200
    assert file_resp.data == b"fake image data"
