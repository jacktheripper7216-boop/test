from flask import Flask
from app.db import db, migrate
from config import Config
from flask_login import LoginManager

# Initialize Flask-Login
login_manager = LoginManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # User loader for Flask-Login (required even for API for session/token management later)
    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from app import models  # Register models

    # Register API Blueprint (New addition)
    from app.api import bp as api_bp

    app.register_blueprint(api_bp)

    return app
