import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, jsonify, current_app
from src.models.user_model import User, UserRole

# Secret key para JWT - deve estar em variável de ambiente em produção
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

class AuthService:
    """Serviço de autenticação e autorização"""
    
    @staticmethod
    def generate_token(user: User) -> str:
        """
        Gera um token JWT para o usuário
        
        Args:
            user: Usuário para o qual gerar o token
            
        Returns:
            Token JWT codificado
        """
        payload = {
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return token
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verifica e decodifica um token JWT
        
        Args:
            token: Token JWT para verificar
            
        Returns:
            Payload decodificado ou None se inválido
        """
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def get_token_from_request(req) -> Optional[str]:
        """
        Extrai o token do header Authorization
        
        Args:
            req: Request do Flask
            
        Returns:
            Token ou None
        """
        auth_header = req.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:]  # Remove 'Bearer '
        return None
    
    @staticmethod
    def login(email: str, password: str) -> tuple[Optional[str], Optional[Dict], Optional[str]]:
        """
        Realiza login do usuário
        
        Args:
            email: Email do usuário
            password: Senha do usuário
            
        Returns:
            Tupla (token, user_data, error_message)
        """
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return None, None, "Email ou senha inválidos"
        
        if not user.is_active:
            return None, None, "Usuário inativo"
        
        if not user.check_password(password):
            return None, None, "Email ou senha inválidos"
        
        token = AuthService.generate_token(user)
        user_data = user.to_dict()
        
        return token, user_data, None
    
    @staticmethod
    def register_user(email: str, name: str, password: str, role: str = UserRole.ENGENHEIRO.value) -> tuple[Optional[User], Optional[str]]:
        """
        Registra um novo usuário (apenas admin pode fazer isso)
        
        Args:
            email: Email do novo usuário
            name: Nome do novo usuário
            password: Senha do novo usuário
            role: Role do novo usuário (padrão: engenheiro)
            
        Returns:
            Tupla (user, error_message)
        """
        # Validar email
        if not email or '@' not in email:
            return None, "Email inválido"
        
        # Validar se email já existe
        if User.query.filter_by(email=email).first():
            return None, "Email já cadastrado"
        
        # Validar role
        valid_roles = [UserRole.ADMIN.value, UserRole.ENGENHEIRO.value, UserRole.GERENTE.value]
        if role not in valid_roles:
            return None, f"Role inválida. Roles válidas: {', '.join(valid_roles)}"
        
        # Validar senha
        if not password or len(password) < 6:
            return None, "Senha deve ter pelo menos 6 caracteres"
        
        # Criar novo usuário
        user = User(email=email, name=name, role=role)
        user.set_password(password)
        
        return user, None


def token_required(f):
    """
    Decorador para exigir token JWT válido
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = AuthService.get_token_from_request(request)
        
        if not token:
            return jsonify({"error": "Token ausente"}), 401
        
        payload = AuthService.verify_token(token)
        
        if not payload:
            return jsonify({"error": "Token inválido ou expirado"}), 401
        
        # Armazena o usuário no contexto
        request.user_id = payload['user_id']
        request.user_email = payload['email']
        request.user_role = payload['role']
        
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """
    Decorador para exigir role de admin
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = AuthService.get_token_from_request(request)
        
        if not token:
            return jsonify({"error": "Token ausente"}), 401
        
        payload = AuthService.verify_token(token)
        
        if not payload:
            return jsonify({"error": "Token inválido ou expirado"}), 401
        
        if payload['role'] != UserRole.ADMIN.value:
            return jsonify({"error": "Acesso negado. Admin requerido"}), 403
        
        request.user_id = payload['user_id']
        request.user_email = payload['email']
        request.user_role = payload['role']
        
        return f(*args, **kwargs)
    
    return decorated


def role_required(*roles):
    """
    Decorador para exigir uma das roles especificadas
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = AuthService.get_token_from_request(request)
            
            if not token:
                return jsonify({"error": "Token ausente"}), 401
            
            payload = AuthService.verify_token(token)
            
            if not payload:
                return jsonify({"error": "Token inválido ou expirado"}), 401
            
            if payload['role'] not in roles:
                return jsonify({"error": f"Acesso negado. Roles requeridas: {', '.join(roles)}"}), 403
            
            request.user_id = payload['user_id']
            request.user_email = payload['email']
            request.user_role = payload['role']
            
            return f(*args, **kwargs)
        
        return decorated
    
    return decorator
