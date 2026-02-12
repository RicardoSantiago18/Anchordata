import os
import sys
import io
import json

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.app import create_app
from database.db import db
from src.models.user_model import User, UserRole

def write_result(status, message):
    with open("verification_result.txt", "w") as f:
        f.write(f"{status}: {message}")

def run_test():
    try:
        app = create_app()
        app.config.update({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "WTF_CSRF_ENABLED": False
        })

        with app.app_context():
            db.create_all()

            import uuid
            unique_email = f"admin_{uuid.uuid4().hex[:8]}@test.com"
            admin = User(email=unique_email, name="Admin", role=UserRole.ADMIN.value)
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()

            client = app.test_client()

            # Login
            print(f"Logging in as {unique_email}...")
            login_resp = client.post("/api/auth/login", json={"email": unique_email, "password": "admin123"})
            if login_resp.status_code != 200:
                print(f"Login failed: {login_resp.status_code} {login_resp.data}")
                write_result("FAILURE", f"Login failed: {login_resp.status_code} {login_resp.data}")
                return
            token = login_resp.json["token"]
            print("Login successful.")

            # Create Machine
            print("Creating machine...")
            unique_machine_name = f"Verifica Máquina {uuid.uuid4().hex[:6]}"
            unique_serial = f"SN-VER-{uuid.uuid4().hex[:6]}"
            data = {
                "nome_maquina": unique_machine_name,
                "num_serie": unique_serial,
                "data_fabricacao": "2023-05-20",
                "marca": "BrandX",
                "fabricante": "FabY",
                "setor": "SetorZ",
                "contato_fabricante": "Contato",
                "description": "Desc"
            }
            multipart_data = {k: v for k, v in data.items()}
            multipart_data["imagem"] = (io.BytesIO(b"verify image data"), "image_ver.png")

            create_resp = client.post(
                "/api/machines", 
                data=multipart_data, 
                headers={"Authorization": f"Bearer {token}"},
                content_type="multipart/form-data"
            )
            
            if create_resp.status_code != 201:
                print(f"Create failed: {create_resp.status_code} {create_resp.data}")
                write_result("FAILURE", f"Create failed: {create_resp.status_code} {create_resp.data}")
                return
            
            machine_id = create_resp.json["id"]
            image_path = create_resp.json["imagem"]
            print(f"Machine created with ID: {machine_id}, Image Path: {image_path}")

            # Get Details
            print("Getting details...")
            get_resp = client.get(f"/api/machines/{machine_id}")
            if get_resp.status_code != 200:
                print(f"Get details failed: {get_resp.status_code} {get_resp.data}")
                write_result("FAILURE", f"Get details failed: {get_resp.status_code} {get_resp.data}")
                return
            print("Details retrieved successfully.")

            # Get File
            print(f"Getting file from /api/machines/files/{image_path}...")
            file_resp = client.get(f"/api/machines/files/{image_path}")
            if file_resp.status_code != 200:
                print(f"Get file failed: {file_resp.status_code} {file_resp.data}")
                write_result("FAILURE", f"Get file failed: {file_resp.status_code} {file_resp.data}")
                return
            
            if file_resp.data != b"verify image data":
                print(f"File content mismatch: {file_resp.data}")
                write_result("FAILURE", f"File content mismatch: {file_resp.data}")
                return

            print("File retrieved successfully and content matches.")
            print("VERIFICATION SUCCESSFUL!")
            write_result("SUCCESS", "Verified")

    except Exception as e:
        print(f"Error: {e}")
        write_result("FAILURE", f"Exception: {e}")

if __name__ == "__main__":
    run_test()
