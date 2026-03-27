from flask import Blueprint
from src.controllers.user_controller import (
    list_users,
    create_user,
    get_user,
    update_user,
    delete_user,
    change_password,
    get_current_user
)
from src.services.auth_service import admin_required, token_required, role_required

user_bp = Blueprint("user", __name__, url_prefix="/api/users")

# Rotas públicas
user_bp.route("/me", methods=["GET"])(token_required(get_current_user))
user_bp.route("/change-password", methods=["POST"])(token_required(change_password))

# Rotas de gerenciamento de usuários (admin e gerente)
manage_users = role_required('admin', 'gerente')
user_bp.route("", methods=["GET"])(manage_users(list_users))
user_bp.route("", methods=["POST"])(manage_users(create_user))
user_bp.route("/<int:user_id>", methods=["GET"])(manage_users(get_user))
user_bp.route("/<int:user_id>", methods=["PUT"])(manage_users(update_user))
user_bp.route("/<int:user_id>", methods=["DELETE"])(manage_users(delete_user))
