# Buneko Blooms Java Backend

Java Spring Boot backend implementation following MVC (Model-View-Controller) pattern, providing RESTful APIs similar to the Node.js backend.

## Project Structure

```
java-backend/
├── src/
│   ├── main/
│   │   ├── java/com/buneko/blooms/
│   │   │   ├── controller/      # REST Controllers (API endpoints)
│   │   │   ├── service/         # Business Logic Layer
│   │   │   ├── repository/     # Data Access Layer (JPA Repositories)
│   │   │   ├── model/           # Entity Classes (Database Models)
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── config/          # Configuration Classes
│   │   │   ├── exception/       # Exception Handling
│   │   │   ├── util/            # Utility Classes
│   │   │   └── security/        # Security Configuration
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## MVC Pattern Implementation

### Model Layer (`model/`)
- Entity classes representing database tables
- Uses JPA annotations for ORM mapping
- Examples: `User.java`, `Product.java`, `Order.java`, etc.

### View Layer (`controller/`)
- REST Controllers handling HTTP requests
- Maps to Service layer for business logic
- Returns JSON responses via DTOs
- Examples: `AuthController.java`, `ProductController.java`, etc.

### Controller Layer (`service/`)
- Business logic implementation
- Transaction management
- Data validation and processing
- Examples: `AuthService.java`, `ProductService.java`, etc.

### Repository Layer (`repository/`)
- Data access using Spring Data JPA
- Extends `JpaRepository` for CRUD operations
- Custom query methods
- Examples: `UserRepository.java`, `ProductRepository.java`, etc.

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Database**: MySQL
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Password Encoding**: BCrypt
- **Validation**: Jakarta Validation

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Products (`/api/products`)
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Categories (`/api/categories`)
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/{id}` - Update category (admin only)
- `DELETE /api/categories/{id}` - Delete category (admin only)

### Orders (`/api/orders`)
- `GET /api/orders` - Get all orders (admin) or user orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}/status` - Update order status (admin)

### Users (`/api/users`)
- `GET /api/users` - Get all users (admin)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `PATCH /api/users/{id}/status` - Toggle user status (admin)

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/{productId}` - Remove from wishlist

### Content (`/api/contents`)
- `GET /api/contents` - Get all content
- `GET /api/contents/{id}` - Get content by ID
- `POST /api/contents` - Create content (admin)
- `PUT /api/contents/{id}` - Update content (admin)
- `DELETE /api/contents/{id}` - Delete content (admin)

### Customizations (`/api/customizations`)
- `GET /api/customizations/my-customizations` - Get user customizations
- `GET /api/customizations` - Get all customizations (admin)
- `GET /api/customizations/{id}` - Get customization by ID
- `POST /api/customizations` - Create customization request
- `PATCH /api/customizations/{id}/status` - Update status (admin)

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Get dashboard statistics (admin)

### Payments (`/api/payments`)
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session

## Configuration

### Database Configuration
Update `application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/EduConnect
spring.datasource.username=root
spring.datasource.password=your_password
```

### JWT Configuration
```properties
jwt.secret=your-super-secret-jwt-key-change-this-in-production
jwt.expiration=604800000
```

### CORS Configuration
```properties
cors.allowed-origins=http://localhost:8080
```

## Running the Application

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Build and Run
```bash
# Navigate to java-backend directory
cd java-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The server will start on `http://localhost:5000`

## API Response Format

All APIs follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Security

- JWT-based authentication
- BCrypt password hashing
- Role-based access control (customer, admin, superadmin)
- CORS configuration
- Input validation using Jakarta Validation

## Database Schema

The application uses the same database schema as the Node.js backend:
- `users` - User accounts
- `categories` - Product categories
- `products` - Products
- `orders` - Orders
- `order_items` - Order items
- `wishlist` - User wishlist
- `contents` - TikTok/content links
- `customizations` - Customization requests


