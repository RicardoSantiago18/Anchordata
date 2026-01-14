from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .user_model import User
from app import db

class Engenheiro(User):
    __tablename__ = "engenheiros"

    id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )

    nome_eng: Mapped[str] = mapped_column(db.String(100))

    __mapper_args__ = {
        "polymorphic_identity": "engenheiro",
    }