"""
Script para inicializar o banco de dados e criar usuário admin inicial.

Uso:
    python init_db.py
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório do backend ao path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

from src.app import create_app
from database.db import db
from src.models.user_model import User, UserRole
from src.services.auth_service import AuthService

def init_database():
    """Inicializa o banco de dados e cria o usuário admin"""
    
    app = create_app()
    
    with app.app_context():
        # Criar todas as tabelas
        #print("🔄 Criando tabelas do banco de dados...")
        #db.create_all()
        #print("✅ Tabelas criadas com sucesso!")
        
        # Verificar se já existe admin
        admin_user = User.query.filter_by(email='admin@anchordata.com').first()
        
        if admin_user:
            print("⚠️  Usuário admin já existe!")
            return
        
        # Criar usuário admin
        print("\n📝 Criando usuário admin...")
        admin_user = User(
            email='admin@anchordata.com',
            name='Administrador',
            role=UserRole.ADMIN.value,
            is_active=True
        )
        admin_user.set_password('admin123456')  # MUDAR ESTA SENHA EM PRODUÇÃO!
        
        db.session.add(admin_user)
        db.session.commit()
        
        print("✅ Usuário admin criado com sucesso!")
        print(f"\n📊 Credenciais de acesso:")
        print(f"   Email: admin@anchordata.com")
        print(f"   Senha: admin123456")
        print("\n⚠️  IMPORTANTE: Mude a senha do admin no primeiro acesso!")
        
        # Criar alguns usuários de exemplo
        print("\n📝 Criando usuários de exemplo...")
        
        usuarios_exemplo = [
            {
                'email': 'engenheiro1@anchordata.com',
                'name': 'João Engenheiro',
                'password': 'eng123456',
                'role': UserRole.ENGENHEIRO.value
            },
            {
                'email': 'gerente1@anchordata.com',
                'name': 'Maria Gerente',
                'password': 'ger123456',
                'role': UserRole.GERENTE.value
            }
        ]
        
        for usuario_data in usuarios_exemplo:
            user, error = AuthService.register_user(
                usuario_data['email'],
                usuario_data['name'],
                usuario_data['password'],
                usuario_data['role']
            )
            
            if error:
                print(f"❌ Erro ao criar {usuario_data['name']}: {error}")
                continue
            
            db.session.add(user)
            db.session.commit()
            print(f"✅ {usuario_data['name']} criado com sucesso!")
        
        print("\n✨ Banco de dados inicializado com sucesso!")
        print("\n📋 Usuários criados:")
        users = User.query.all()
        for user in users:
            print(f"   - {user.email} ({user.role})")

if __name__ == '__main__':
    init_database()
