# Product Service

Product management microservice for the e-commerce platform.

## Features

- MySQL database for product storage
- RESTful API endpoints
- Product filtering and search
- CRUD operations
- Sample data seeding
- Connection pooling for better performance

## Setup

1. Install MySQL locally or use a cloud MySQL instance
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:

   ```
   PORT=8001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ecommerce
   ```

4. The service will automatically create the products table on startup

5. Start the service:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## API Endpoints

### Get All Products

```
GET /api/products
Query params: ?category=Shoes&search=nike&minPrice=20&maxPrice=100
```

### Get Single Product

```
GET /api/products/:id
```

### Create Product (Admin)

```
POST /api/products
Body: {
  "name": "Product Name",
  "description": "Description",
  "price": 99.99,
  "image": "/image.png",
  "category": "Category",
  "stock": 50
}
```

### Update Product (Admin)

```
PUT /api/products/:id
Body: { fields to update }
```

### Delete Product (Admin)

```
DELETE /api/products/:id
```

### Seed Sample Data

```
POST /api/products/seed
```

### Health Check

```
GET /health
```

## Database Schema

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Install MySQL on macOS

```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation (optional but recommended)
mysql_secure_installation

# Access MySQL
mysql -u root -p
```

createdAt: Date,
updatedAt: Date
}

```

```
