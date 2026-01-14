from flask import Flask
from database.config import Config
from database.db import db
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    Migrate(app, db)

    from routes.chat_routes import chat_bp
    from routes.login_routes import login_bp
    from routes.home_routes import home_bp

    app.register_blueprint(chat_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(home_bp)

    return app