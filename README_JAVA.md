# Smart Inventory Management System - Java Backend

This is a Java Spring Boot conversion of the original Python Flask backend.

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** (for database operations)
- **Spring Web** (for REST API)
- **H2 Database** (in-memory database, can be switched to MySQL/PostgreSQL)
- **Lombok** (to reduce boilerplate code)
- **Maven** (build tool)

## Project Structure

```
src/
├── main/
│   ├── java/com/smartinventory/
│   │   ├── SmartInventoryApplication.java  # Main application class
│   │   ├── config/                         # Configuration classes
│   │   │   └── SecurityConfig.java
│   │   ├── controller/                     # REST controllers
│   │   │   ├── AuthController.java
│   │   │   ├── CategoryController.java
│   │   │   ├── ProductController.java
│   │   │   ├── SupplierController.java
│   │   │   └── StockController.java
│   │   ├── dto/                            # Data Transfer Objects
│   │   │   ├── ApiResponse.java
│   │   │   ├── CategoryDto.java
│   │   │   ├── ProductDto.java
│   │   │   ├── SupplierDto.java
│   │   │   ├── StockDto.java
│   │   │   └── UserRegistrationDto.java
│   │   ├── exception/                      # Exception handlers
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── model/                          # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Auth.java
│   │   │   ├── Category.java
│   │   │   ├── Product.java
│   │   │   ├── Supplier.java
│   │   │   ├── Stock.java
│   │   │   ├── Client.java
│   │   │   ├── Sale.java
│   │   │   └── SaleItem.java
│   │   └── repository/                     # Spring Data JPA repositories
│   │       ├── UserRepository.java
│   │       ├── AuthRepository.java
│   │       ├── CategoryRepository.java
│   │       ├── ProductRepository.java
│   │       ├── SupplierRepository.java
│   │       ├── StockRepository.java
│   │       ├── ClientRepository.java
│   │       ├── SaleRepository.java
│   │       └── SaleItemRepository.java
│   └── resources/
│       └── application.properties          # Application configuration
└── test/
    └── java/com/smartinventory/            # Test classes
```

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

## How to Run

### 1. Build the project

```bash
mvn clean install
```

### 2. Run the application

```bash
mvn spring-boot:run
```

Or run the JAR file:

```bash
java -jar target/smart-inventory-1.0.0.jar
```

The application will start on **http://localhost:5000**

## API Endpoints

All endpoints are under the `/api` prefix.

### Authentication

- **POST** `/api/register` - Register a new user

### Categories

- **GET** `/api/categories` - Get all categories
- **GET** `/api/categories/{id}` - Get category by ID
- **POST** `/api/categories` - Create a new category
- **PUT** `/api/categories/{id}` - Update category
- **DELETE** `/api/categories/{id}` - Delete category

### Products

- **GET** `/api/products` - Get all products
- **GET** `/api/products/{id}` - Get product by ID
- **POST** `/api/products` - Create a new product
- **PUT** `/api/products/{id}` - Update product
- **DELETE** `/api/products/{id}` - Delete product

### Suppliers

- **GET** `/api/suppliers` - Get all suppliers
- **GET** `/api/suppliers/{id}` - Get supplier by ID
- **POST** `/api/suppliers` - Create a new supplier
- **PUT** `/api/suppliers/{id}` - Update supplier
- **DELETE** `/api/suppliers/{id}` - Delete supplier

### Stock

- **GET** `/api/stocks` - Get all stock items
- **GET** `/api/stocks/{id}` - Get stock by ID
- **POST** `/api/stocks` - Create a new stock entry
- **PUT** `/api/stocks/{id}` - Update stock
- **DELETE** `/api/stocks/{id}` - Delete stock

## Database

The application uses **H2** in-memory database by default. The database file is stored at `./data/inventory_db`.

### H2 Console

You can access the H2 database console at:
- URL: http://localhost:5000/h2-console
- JDBC URL: `jdbc:h2:file:./data/inventory_db`
- Username: `sa`
- Password: (leave empty)

### Switching to MySQL/PostgreSQL

To use MySQL or PostgreSQL instead:

1. Add the appropriate driver dependency in `pom.xml`
2. Update `application.properties` with the new database configuration

Example for MySQL:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

## Key Differences from Python Flask Version

1. **Type Safety**: Java provides compile-time type checking
2. **Dependency Injection**: Spring's IoC container manages dependencies
3. **JPA Annotations**: Database mapping is done via JPA annotations instead of SQLAlchemy
4. **Repository Pattern**: Spring Data JPA provides automatic CRUD operations
5. **Configuration**: Uses `application.properties` instead of Python config files
6. **Password Hashing**: Uses BCrypt (similar to Python's werkzeug)

## Development

### Running Tests

```bash
mvn test
```

### Building for Production

```bash
mvn clean package -DskipTests
```

This creates an executable JAR in the `target/` directory.

## Migration Notes

This Java backend is a complete conversion of the Python Flask backend with:
- ✅ All 9 database models converted to JPA entities
- ✅ All CRUD operations for Categories, Products, Suppliers, and Stock
- ✅ User registration with password hashing
- ✅ Global exception handling
- ✅ Input validation
- ✅ Same API endpoints and response format

## Future Enhancements

- Add JWT-based authentication
- Implement Client and Sale endpoints
- Add unit and integration tests
- Add API documentation (Swagger/OpenAPI)
- Implement pagination for list endpoints
