import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Suporte para PostgreSQL em produção e SQLite em desenvolvimento
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Fallback para SQLite em desenvolvimento
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me-in-production')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24