from flask import request, jsonify
from src.services.auth_service import AuthService

def login():
    """
    Endpoint de login
    Recebe: { "email": "user@email.com", "password": "senha123" }
    Retorna: { "success": true, "token": "jwt_token", "user": {...} }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email e senha são obrigatórios"}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        # Fazer login
        token, user_data, error = AuthService.login(email, password)
        
        if error:
            return jsonify({"error": error}), 401
        
        response = {
            "success": True,
            "token": token,
            "user": user_data
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def logout():
    """
    Endpoint de logout
    O logout é implementado no frontend removendo o token
    """
    return jsonify({"success": True, "message": "Desconectado com sucesso"}), 200
