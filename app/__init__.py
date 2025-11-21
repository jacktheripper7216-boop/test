from flask import Flask, render_template
from app.db import db, migrate
from config import Config
from flask_login import LoginManager
import os

# Initialize Flask-Login
login_manager = LoginManager()


def create_app(config_class=Config):
    # Get the base directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    app = Flask(__name__,
                template_folder=os.path.join(base_dir, 'templates'),
                static_folder=os.path.join(base_dir, 'static'))
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

    # Route for serving the frontend
    @app.route('/')
    def index():
        return render_template('index.html')

    return app
