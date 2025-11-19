from flask import request
from flask_restful import Resource
from app.api import api
from app.db import db
from app.models import Category, Product, Supplier, Stock, User  # Import Stock and User

from datetime import datetime, date  # ADD THIS IMPORT


# --- Utility Functions for Serialization ---


def category_to_json(category):
    """Converts a Category model instance to a JSON dictionary."""
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
    }


def product_to_json(product):
    """Converts a Product model instance to a JSON dictionary."""
    return {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "description": product.description,
        "warranty_months": product.warranty_months,
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else None,
    }


def supplier_to_json(supplier):
    """Converts a Supplier model instance to a JSON dictionary."""
    return {
        "id": supplier.id,
        "name": supplier.name,
        "contact_person": supplier.contact_person,
        "phone": supplier.phone,
        "email": supplier.email,
        "address": supplier.address,
        "additional_fees": (
            str(supplier.additional_fees)
            if supplier.additional_fees is not None
            else None
        ),
    }


def stock_to_json(stock):
    """Converts a Stock model instance to a JSON dictionary."""
    return {
        "id": stock.id,
        "product_id": stock.product_id,
        "supplier_id": stock.supplier_id,
        "location": stock.location,
        "quantity": stock.quantity,
        "cost_price": str(stock.cost_price) if stock.cost_price is not None else None,
        "selling_price": str(stock.selling_price),
        "deposited_by_user_id": stock.deposited_by_user_id,
        "deposited_at": stock.deposited_at.isoformat() if stock.deposited_at else None,
        "expiration_date": (
            stock.expiration_date.isoformat() if stock.expiration_date else None
        ),
        # Display related information for readability
        "product_name": stock.product.name if stock.product else None,
        "supplier_name": stock.supplier.name if stock.supplier else None,
        "depositor_username": stock.depositor.username if stock.depositor else None,
    }


# --- Inventory API Resources (Category, Product, Supplier omitted for brevity) ---


class CategoryResource(Resource):
    # ... CRUD methods ...
    def get(self, category_id=None):
        if category_id is None:
            categories = db.session.scalars(db.select(Category)).all()
            return [category_to_json(c) for c in categories], 200
        else:
            category = db.session.get(Category, category_id)
            if category is None:
                return {"message": "Category not found"}, 404
            return category_to_json(category), 200

    def post(self):
        data = request.get_json()
        if not data or "name" not in data:
            return {"message": "Category name is required"}, 400
        if (
            db.session.scalar(db.select(Category).filter_by(name=data["name"]))
            is not None
        ):
            return {"message": f"Category '{data['name']}' already exists."}, 409
        new_category = Category(name=data["name"], description=data.get("description"))
        db.session.add(new_category)
        db.session.commit()
        return category_to_json(new_category), 201

    def put(self, category_id):
        category = db.session.get(Category, category_id)
        if category is None:
            return {"message": "Category not found"}, 404
        data = request.get_json()
        if "name" in data:
            category.name = data["name"]
        if "description" in data:
            category.description = data["description"]
        db.session.commit()
        return category_to_json(category), 200

    def delete(self, category_id):
        category = db.session.get(Category, category_id)
        if category is None:
            return {"message": "Category not found"}, 404
        db.session.delete(category)
        db.session.commit()
        return {"message": "Category deleted successfully"}, 204


class ProductResource(Resource):
    # ... CRUD methods ...
    def get(self, product_id=None):
        if product_id is None:
            products = db.session.scalars(db.select(Product)).all()
            return [product_to_json(p) for p in products], 200
        else:
            product = db.session.get(Product, product_id)
            if product is None:
                return {"message": "Product not found"}, 404
            return product_to_json(product), 200

    def post(self):
        data = request.get_json()
        if not all(k in data for k in ("name", "category_id")):
            return {"message": "Product name and category_id are required"}, 400
        if db.session.get(Category, data["category_id"]) is None:
            return {
                "message": f"Category with ID {data['category_id']} not found."
            }, 400
        new_product = Product(
            name=data["name"],
            brand=data.get("brand"),
            description=data.get("description"),
            warranty_months=data.get("warranty_months"),
            category_id=data["category_id"],
        )
        db.session.add(new_product)
        db.session.commit()
        return product_to_json(new_product), 201

    def put(self, product_id):
        product = db.session.get(Product, product_id)
        if product is None:
            return {"message": "Product not found"}, 404
        data = request.get_json()
        if "category_id" in data:
            if db.session.get(Category, data["category_id"]) is None:
                return {
                    "message": f"Category with ID {data['category_id']} not found."
                }, 400
            product.category_id = data["category_id"]
        if "name" in data:
            product.name = data["name"]
        if "brand" in data:
            product.brand = data["brand"]
        if "description" in data:
            product.description = data["description"]
        if "warranty_months" in data:
            product.warranty_months = data["warranty_months"]
        db.session.commit()
        return product_to_json(product), 200

    def delete(self, product_id):
        product = db.session.get(Product, product_id)
        if product is None:
            return {"message": "Product not found"}, 404
        db.session.delete(product)
        db.session.commit()
        return {"message": "Product deleted successfully"}, 204


class SupplierResource(Resource):
    # ... CRUD methods ...
    def get(self, supplier_id=None):
        if supplier_id is None:
            suppliers = db.session.scalars(db.select(Supplier)).all()
            return [supplier_to_json(s) for s in suppliers], 200
        else:
            supplier = db.session.get(Supplier, supplier_id)
            if supplier is None:
                return {"message": "Supplier not found"}, 404
            return supplier_to_json(supplier), 200

    def post(self):
        data = request.get_json()
        if not data or "name" not in data:
            return {"message": "Supplier name is required"}, 400
        new_supplier = Supplier(
            name=data["name"],
            contact_person=data.get("contact_person"),
            phone=data.get("phone"),
            email=data.get("email"),
            address=data.get("address"),
            additional_fees=data.get("additional_fees"),
        )
        db.session.add(new_supplier)
        db.session.commit()
        return supplier_to_json(new_supplier), 201

    def put(self, supplier_id):
        supplier = db.session.get(Supplier, supplier_id)
        if supplier is None:
            return {"message": "Supplier not found"}, 404
        data = request.get_json()
        if "name" in data:
            supplier.name = data["name"]
        if "contact_person" in data:
            supplier.contact_person = data["contact_person"]
        if "phone" in data:
            supplier.phone = data["phone"]
        if "email" in data:
            supplier.email = data["email"]
        if "address" in data:
            supplier.address = data["address"]
        if "additional_fees" in data:
            supplier.additional_fees = data["additional_fees"]
        db.session.commit()
        return supplier_to_json(supplier), 200

    def delete(self, supplier_id):
        supplier = db.session.get(Supplier, supplier_id)
        if supplier is None:
            return {"message": "Supplier not found"}, 404
        db.session.delete(supplier)
        db.session.commit()
        return {"message": "Supplier deleted successfully"}, 204


# --- Stock API Resource (NEW) ---


class StockResource(Resource):

    # READ: Get a list of all stock items or a single stock item
    def get(self, stock_id=None):
        if stock_id is None:
            # GET /api/stocks (List all)
            stocks = db.session.scalars(db.select(Stock)).all()
            return [stock_to_json(s) for s in stocks], 200
        else:
            # GET /api/stocks/<stock_id> (Get single)
            stock = db.session.get(Stock, stock_id)
            if stock is None:
                return {"message": "Stock item not found"}, 404
            return stock_to_json(stock), 200

    # CREATE: Create a new stock item
    def post(self):
        data = request.get_json()
        required_fields = [
            "product_id",
            "supplier_id",
            "quantity",
            "selling_price",
            "deposited_by_user_id",
        ]

        if not all(k in data for k in required_fields):
            return {
                "message": f"Missing required fields: {', '.join(required_fields)}"
            }, 400

        # Foreign Key Validation
        if db.session.get(Product, data["product_id"]) is None:
            return {"message": f"Product with ID {data['product_id']} not found."}, 400
        if db.session.get(Supplier, data["supplier_id"]) is None:
            return {
                "message": f"Supplier with ID {data['supplier_id']} not found."
            }, 400
        if db.session.get(User, data["deposited_by_user_id"]) is None:
            return {
                "message": f"User with ID {data['deposited_by_user_id']} not found."
            }, 400

        # --- FIX: Date Conversion ---
        expiration_date = data.get("expiration_date")
        if expiration_date:
            try:
                # Convert string 'YYYY-MM-DD' to Python date object
                expiration_date = datetime.strptime(expiration_date, "%Y-%m-%d").date()
            except ValueError:
                return {
                    "message": "Invalid date format for expiration_date. Use YYYY-MM-DD."
                }, 400
        # --- END FIX ---

        # Create new stock item
        new_stock = Stock(
            product_id=data["product_id"],
            supplier_id=data["supplier_id"],
            quantity=data["quantity"],
            selling_price=data["selling_price"],
            deposited_by_user_id=data["deposited_by_user_id"],
            location=data.get("location"),
            cost_price=data.get("cost_price"),
            # Use the converted date object
            expiration_date=expiration_date,
        )

        db.session.add(new_stock)
        db.session.commit()

        return stock_to_json(new_stock), 201  # 201 Created

    # UPDATE: Update an existing stock item
    def put(self, stock_id):
        stock = db.session.get(Stock, stock_id)
        if stock is None:
            return {"message": "Stock item not found"}, 404

        data = request.get_json()

        # Validate Foreign Key updates if present
        if "product_id" in data and db.session.get(Product, data["product_id"]) is None:
            return {"message": f"Product with ID {data['product_id']} not found."}, 400
        if (
            "supplier_id" in data
            and db.session.get(Supplier, data["supplier_id"]) is None
        ):
            return {
                "message": f"Supplier with ID {data['supplier_id']} not found."
            }, 400
        if (
            "deposited_by_user_id" in data
            and db.session.get(User, data["deposited_by_user_id"]) is None
        ):
            return {
                "message": f"User with ID {data['deposited_by_user_id']} not found."
            }, 400

        # Update fields
        if "product_id" in data:
            stock.product_id = data["product_id"]
        if "supplier_id" in data:
            stock.supplier_id = data["supplier_id"]
        if "quantity" in data:
            stock.quantity = data["quantity"]
        if "selling_price" in data:
            stock.selling_price = data["selling_price"]
        if "deposited_by_user_id" in data:
            stock.deposited_by_user_id = data["deposited_by_user_id"]
        if "location" in data:
            stock.location = data["location"]
        if "cost_price" in data:
            stock.cost_price = data["cost_price"]
        if "expiration_date" in data:
            stock.expiration_date = data["expiration_date"]

        db.session.commit()
        return stock_to_json(stock), 200  # 200 OK

    # DELETE: Delete a stock item
    def delete(self, stock_id):
        stock = db.session.get(Stock, stock_id)
        if stock is None:
            return {"message": "Stock item not found"}, 404

        db.session.delete(stock)
        db.session.commit()
        return {"message": "Stock item deleted successfully"}, 204


# --- Register the Resources ---

# Category Endpoints
api.add_resource(CategoryResource, "/categories", "/categories/<int:category_id>")

# Product Endpoints
api.add_resource(ProductResource, "/products", "/products/<int:product_id>")

# Supplier Endpoints
api.add_resource(SupplierResource, "/suppliers", "/suppliers/<int:supplier_id>")

# Stock Endpoints (NEW)
api.add_resource(StockResource, "/stocks", "/stocks/<int:stock_id>")
