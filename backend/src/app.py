from flask import Flask
from flask_cors import CORS
from database.config import Config
from database.db import db
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ativar CORS para comunicação com o frontend
    CORS(app, resources={
        r"/login": {"origins": "http://localhost:5173"},
        r"/chat/*": {"origins": "http://localhost:5173"},
        r"/message/*": {"origins": "http://localhost:5173"},
        r"/home/*": {"origins": "http://localhost:5173"}
    }, supports_credentials=True)

    db.init_app(app)
    Migrate(app, db)

    from src.routes.chat_routes import chat_bp
    from src.routes.message_routes import message_bp
    from src.routes.login_routes import login_bp
    from src.routes.home_routes import home_bp

    app.register_blueprint(chat_bp)
    app.register_blueprint(message_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(home_bp)

    return app