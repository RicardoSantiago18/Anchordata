from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from database.db import db

class User(db.Model):
    __tablename__ = "users"

    # Identificação do usuário
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    # Nome do usuário
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique = True)
    # Senha do usuário
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    # Cargo do usuário: Engenheiro ou Gerente
    function: so.Mapped[str] = so.mapped_column(sa.String(50))

    __mapper_args__ = {
        "polymorphic_on": function,
        "polymorphic_identity": "user",
    }

    def __repr__(self):
        return '<User {}>', format(self.username)