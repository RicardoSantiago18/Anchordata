from src.models.user_model import User
from database.db import db

def get_mock_user():
    user = User.query.get(1)

    if not user:
        user = User(
            id=1,
            name="dev",
            function="user",
            password_hash="dev"
        )
        db.session.add(user)
        db.session.commit()

    return user
