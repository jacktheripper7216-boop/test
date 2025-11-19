from flask import request
from flask_restful import Resource
from app.api import api  # Import the initialized API object
from app.models import User, Auth
from app.db import db
from sqlalchemy.exc import IntegrityError


class Register(Resource):
    def post(self):
        # 1. Get JSON data from the request
        data = request.get_json()

        # 2. Basic input validation (must provide username, email, and password)
        if not all(k in data for k in ("username", "email", "password")):
            return {
                "message": "Missing required fields (username, email, password)"
            }, 400

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("full_name")

        # 3. Check if user already exists
        if db.session.scalar(db.select(User).filter_by(username=username)) is not None:
            return {
                "message": f'User with username "{username}" already exists.'
            }, 409  # 409 Conflict

        if db.session.scalar(db.select(User).filter_by(email=email)) is not None:
            return {
                "message": f'User with email "{email}" already exists.'
            }, 409  # 409 Conflict

        try:
            # 4. Create new User and Auth records
            new_user = User(username=username, email=email, full_name=full_name)
            db.session.add(new_user)
            db.session.flush()  # Flush to get the new user.id

            new_auth = Auth(user_id=new_user.id)
            new_auth.set_password(password)  # Hash and set the password

            db.session.add(new_auth)
            db.session.commit()

            # 5. Return success JSON response
            return {
                "message": "User registered successfully",
                "user": {
                    "id": new_user.id,
                    "username": new_user.username,
                    "email": new_user.email,
                },
            }, 201  # 201 Created

        except IntegrityError:
            db.session.rollback()
            return {"message": "Database error occurred during registration."}, 500
        except Exception as e:
            db.session.rollback()
            return {"message": f"An unexpected error occurred: {str(e)}"}, 500


# Add the resource to the API
# This maps the Register class to the /register endpoint under the /api prefix
api.add_resource(Register, "/register")
