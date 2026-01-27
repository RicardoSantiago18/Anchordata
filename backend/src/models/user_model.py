from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    ENGENHEIRO = "engenheiro"
    GERENTE = "gerente"

class User(db.Model):
    __tablename__ = "users"

    # Identificação do usuário
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    # Email do usuário (identificador único)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    # Nome do usuário
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    # Senha do usuário (hash)
    password_hash: so.Mapped[str] = so.mapped_column(sa.String(256))
    # Role do usuário: admin, engenheiro ou gerente
    role: so.Mapped[str] = so.mapped_column(sa.String(50), default=UserRole.ENGENHEIRO.value)
    # Data de criação
    created_at: so.Mapped[sa.DateTime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    # Status ativo/inativo
    is_active: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=True)

    def set_password(self, password: str):
        """Hash e armazena a senha do usuário"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verifica se a senha fornecida corresponde ao hash armazenado"""
        return check_password_hash(self.password_hash, password)

    def is_admin(self) -> bool:
        """Verifica se o usuário é admin"""
        return self.role == UserRole.ADMIN.value

    def is_engenheiro(self) -> bool:
        """Verifica se o usuário é engenheiro"""
        return self.role == UserRole.ENGENHEIRO.value

    def is_gerente(self) -> bool:
        """Verifica se o usuário é gerente"""
        return self.role == UserRole.GERENTE.value

    def to_dict(self, include_password=False):
        """Retorna os dados do usuário como dicionário"""
        data = {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_password:
            data["password_hash"] = self.password_hash
        return data

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"