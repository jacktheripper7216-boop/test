import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Define the path to the local SQLite file
SQLALCHEMY_LOCAL_URI = "sqlite:///" + os.path.join(BASE_DIR, "app.db")


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    # Use the environment variable, or default to the local SQLite file
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or SQLALCHEMY_LOCAL_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
