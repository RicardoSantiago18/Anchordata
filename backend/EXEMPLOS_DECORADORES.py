"""
Exemplos de como usar os decoradores de autenticação e autorização
em suas rotas e controllers.
"""

# Exemplo 1: Rota que requer autenticação (qualquer usuário logado)
# =====================================================

from flask import Blueprint, request, jsonify
from src.services.auth_service import token_required, admin_required, role_required
from src.models.user_model import UserRole

example_bp = Blueprint('example', __name__, url_prefix='/api/example')

@example_bp.route('/minha-maquina', methods=['GET'])
@token_required
def minha_maquina():
    """
    Qualquer usuário autenticado pode acessar
    """
    user_id = request.user_id
    user_email = request.user_email
    user_role = request.user_role
    
    # Lógica da sua aplicação
    return jsonify({
        "message": f"Você é {user_email} com role {user_role}",
        "user_id": user_id
    }), 200


# Exemplo 2: Rota que requer role específica (apenas engenheiros)
# =====================================================

@example_bp.route('/maquinas', methods=['GET'])
@role_required(UserRole.ENGENHEIRO.value, UserRole.ADMIN.value)
def list_maquinas():
    """
    Apenas engenheiros e admins podem acessar
    """
    # Você pode acessar as informações do usuário
    user_role = request.user_role
    
    # Lógica da sua aplicação
    return jsonify({
        "message": f"Mostrando máquinas para {user_role}"
    }), 200


# Exemplo 3: Rota que requer role de admin
# =====================================================

@example_bp.route('/relatorios-admin', methods=['GET'])
@admin_required
def relatorios_admin():
    """
    Apenas admins podem acessar
    """
    # Lógica da sua aplicação
    return jsonify({
        "message": "Relatórios administrativos"
    }), 200


# Exemplo 4: Rota com lógica condicional baseada em role
# =====================================================

@example_bp.route('/dashboard', methods=['GET'])
@token_required
def dashboard():
    """
    Rota que mostra conteúdo diferente baseado na role
    """
    user_role = request.user_role
    
    if user_role == UserRole.ADMIN.value:
        data = {
            "title": "Dashboard Admin",
            "widgets": ["usuarios", "relatorios", "maquinas", "monitoracao"]
        }
    elif user_role == UserRole.ENGENHEIRO.value:
        data = {
            "title": "Dashboard Engenheiro",
            "widgets": ["maquinas", "relatorios"]
        }
    elif user_role == UserRole.GERENTE.value:
        data = {
            "title": "Dashboard Gerente",
            "widgets": ["relatorios", "dashboards"]
        }
    
    return jsonify(data), 200


# Exemplo 5: Usando nos controllers
# =====================================================

# Em controllers/exemplo_controller.py

from src.services.auth_service import token_required, role_required
from src.models.user_model import UserRole

def get_relatorio():
    """
    Controller que recebe user_id do request
    Decorador já valida o token
    """
    user_id = request.user_id
    
    # Usar user_id para buscar dados relacionados ao usuário
    # relatorio = Relatorio.query.filter_by(user_id=user_id).all()
    
    return jsonify({"relatorios": []}), 200


# Em routes/relatorio_routes.py

from flask import Blueprint
from src.controllers.relatorio_controller import get_relatorio
from src.services.auth_service import role_required
from src.models.user_model import UserRole

relatorio_bp = Blueprint('relatorio', __name__, url_prefix='/api/relatorios')

relatorio_bp.route('', methods=['GET'])(
    role_required(UserRole.ENGENHEIRO.value, UserRole.GERENTE.value, UserRole.ADMIN.value)(
        get_relatorio
    )
)


# Exemplo 6: Verificações adicionais com dados do request
# =====================================================

@example_bp.route('/usuario/<int:user_id>', methods=['GET'])
@token_required
def get_user_data(user_id):
    """
    Apenas o usuário ou admin pode ver seus próprios dados
    """
    current_user_id = request.user_id
    current_user_role = request.user_role
    
    # Permitir se é o próprio usuário ou é admin
    if current_user_id != user_id and current_user_role != UserRole.ADMIN.value:
        return jsonify({"error": "Acesso negado"}), 403
    
    # Buscar dados do usuário
    # user = User.query.get(user_id)
    
    return jsonify({"user_id": user_id}), 200
