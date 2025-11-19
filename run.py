from app import create_app
from app.db import db

app = create_app()  # FIXED: Must be called to get the Flask app instance


@app.shell_context_processor
def make_shell_context():
    # Makes 'db' available when running 'flask shell'
    from app.models import User, Product

    return {"db": db, "User": User, "Product": Product}


if __name__ == "__main__":
    app.run(debug=True)
