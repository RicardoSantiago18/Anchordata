from flask import request, jsonify
from src.services.auth_service import AuthService
from src.models.user_model import User, UserRole
from database.db import db

def list_users():
    """
    Lista todos os usuários (apenas admin)
    """
    try:
        users = User.query.all()
        users_data = [user.to_dict() for user in users]
        return jsonify({
            "success": True,
            "total": len(users_data),
            "users": users_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def create_user():
    """
    Cria um novo usuário (apenas admin)
    Recebe: { "email": "...", "name": "...", "password": "...", "role": "..." }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados inválidos"}), 400
        
        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        role = data.get('role', UserRole.ENGENHEIRO.value)
        
        if not email or not name or not password:
            return jsonify({"error": "Email, nome e senha são obrigatórios"}), 400
        
        # Registrar novo usuário
        user, error = AuthService.register_user(email, name, password, role)
        
        if error:
            return jsonify({"error": error}), 400
        
        # Salvar no banco de dados
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Usuário criado com sucesso",
            "user": user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_user(user_id):
    """
    Obtém informações de um usuário específico
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        return jsonify({
            "success": True,
            "user": user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_user(user_id):
    """
    Atualiza informações de um usuário (apenas admin pode atualizar role)
    Recebe: { "name": "...", "role": "..." }
    """
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Validar role se for alterada
        if 'role' in data:
            valid_roles = [UserRole.ADMIN.value, UserRole.ENGENHEIRO.value, UserRole.GERENTE.value]
            if data['role'] not in valid_roles:
                return jsonify({"error": f"Role inválida. Roles válidas: {', '.join(valid_roles)}"}), 400
            user.role = data['role']
        
        if 'name' in data:
            user.name = data['name']
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Usuário atualizado com sucesso",
            "user": user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def delete_user(user_id):
    """
    Deleta um usuário (apenas admin)
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        # Evitar auto-deleção
        if user.id == request.user_id:
            return jsonify({"error": "Você não pode deletar sua própria conta"}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Usuário deletado com sucesso"
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def change_password():
    """
    Permite que um usuário autenticado altere sua própria senha
    Recebe: { "current_password": "...", "new_password": "..." }
    """
    try:
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        data = request.get_json()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({"error": "Senha atual e nova senha são obrigatórias"}), 400
        
        # Validar senha atual
        if not user.check_password(data['current_password']):
            return jsonify({"error": "Senha atual inválida"}), 401
        
        # Validar nova senha
        if len(data['new_password']) < 6:
            return jsonify({"error": "Nova senha deve ter pelo menos 6 caracteres"}), 400
        
        # Atualizar senha
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Senha alterada com sucesso"
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_current_user():
    """
    Retorna informações do usuário atual autenticado
    """
    try:
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        return jsonify({
            "success": True,
            "user": user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
