from app.db import db
from flask_login import UserMixin  # makes flask deal with tokens to remember the data
from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)  # For password handling

from sqlalchemy import PrimaryKeyConstraint


class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    auth_details = db.relationship("Auth", backref="user", uselist=False)


class Auth(db.Model):
    __tablename__ = (
        "auth"  # FIXED: Changed from "user" to "auth" to prevent table name conflict
    )
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    password_hash = db.Column(db.String(128), nullable=False)
    permissions_level = db.Column(db.Integer, default=1, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# --- Inventory Models ---


class Category(db.Model):
    __tablename__ = "category"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)

    products = db.relationship("Product", backref="category", lazy="dynamic")


class Product(db.Model):
    __tablename__ = "product"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    brand = db.Column(db.String(255))
    description = db.Column(db.Text)
    warranty_months = db.Column(db.Integer)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"))

    stocks = db.relationship("Stock", backref="product", lazy="dynamic")


class Supplier(db.Model):
    __tablename__ = "supplier"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    contact_person = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    additional_fees = db.Column(db.Numeric(10, 2))

    stocks = db.relationship("Stock", backref="supplier", lazy="dynamic")


class Stock(db.Model):
    __tablename__ = "stock"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey("supplier.id"), nullable=False)
    location = db.Column(db.String(255))
    quantity = db.Column(db.Integer, nullable=False)
    cost_price = db.Column(db.Numeric(10, 2))
    selling_price = db.Column(db.Numeric(10, 2), nullable=False)
    deposited_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    deposited_at = db.Column(db.DateTime, default=db.func.now())
    expiration_date = db.Column(db.Date)

    sale_items = db.relationship("SaleItem", backref="stock_item", lazy="dynamic")


# --- Sales Models ---


class Client(db.Model):
    __tablename__ = "client"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    contact_phone = db.Column(db.String(20))
    contact_email = db.Column(db.String(120))
    address = db.Column(db.Text)
    is_credit_client = db.Column(db.Boolean, default=False)
    credit_limit = db.Column(db.Numeric(12, 2))
    current_month_status = db.Column(db.String(50))  # e.g., 'PAID', 'PENDING'

    sales = db.relationship("Sale", backref="client", lazy="dynamic")


class Sale(db.Model):
    __tablename__ = "sale"
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False
    )  # Salesperson
    sale_date = db.Column(db.DateTime, default=db.func.now())
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)
    discount_applied = db.Column(db.Numeric(4, 2))
    payment_method = db.Column(db.String(50), nullable=False)

    sale_items = db.relationship(
        "SaleItem", backref="sale", cascade="all, delete-orphan", lazy="dynamic"
    )


class SaleItem(db.Model):
    __tablename__ = "sale_item"
    sale_id = db.Column(db.Integer, db.ForeignKey("sale.id"), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey("stock.id"), nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    unit_price_at_sale = db.Column(db.Numeric(10, 2), nullable=False)

    __table_args__ = (PrimaryKeyConstraint("sale_id", "stock_id", name="pk_sale_item"),)
