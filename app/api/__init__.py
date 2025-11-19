from flask import Blueprint
from flask_restful import Api

# Define the Blueprint for the API routes
bp = Blueprint("api", __name__, url_prefix="/api")

# Initialize Flask-RESTful API object with the Blueprint
api = Api(bp)

# Import resource files here to register them
from app.api import auth
from app.api import inventory
