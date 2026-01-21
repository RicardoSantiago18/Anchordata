from flask import request, jsonify
import json

def login():
    """
    Endpoint de login
    Recebe: { "email": "user@email.com", "password": "senha123" }
    Retorna: { "token": "jwt_token", "user": { "id": 1, "email": "user@email.com", "name": "Nome" } }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email e senha são obrigatórios"}), 400
        
        email = data.get('email')
        password = data.get('password')
        

        # Validar com banco de dados
        # Validação mockada
        user_data = {
            "id": 1,
            "email": email,
            "name": email.split("@")[0],
            "role": "user"
        }
        
        response = {
            "success": True,
            "token": "mock_jwt_token_aqui",
            "user": user_data
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500