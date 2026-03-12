import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection and create table
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL successfully");

    // Create products table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
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
      )
    `);

    connection.release();
    console.log("Database tables initialized");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

initDatabase();

// API Endpoints

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    let query = "SELECT * FROM products WHERE isActive = true";
    const params = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += " AND price >= ?";
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += " AND price <= ?";
      params.push(parseFloat(maxPrice));
    }

    query += " ORDER BY createdAt DESC";

    const [products] = await pool.query(query, params);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new product (admin)
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, image, category, stock || 0],
    );

    const [newProduct] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId],
    );

    res.status(201).json({ success: true, data: newProduct[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update product (admin)
app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, description, price, image, category, stock, isActive } =
      req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (image !== undefined) {
      updates.push("image = ?");
      params.push(image);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      params.push(category);
    }
    if (stock !== undefined) {
      updates.push("stock = ?");
      params.push(stock);
    }
    if (isActive !== undefined) {
      updates.push("isActive = ?");
      params.push(isActive);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    params.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const [updatedProduct] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id],
    );

    res.json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product (admin)
app.delete("/api/products/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE products SET isActive = false WHERE id = ?",
      [req.params.id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seed sample products (development only)
app.post("/api/products/seed", async (req, res) => {
  try {
    // Clear existing products
    await pool.query("DELETE FROM products");

    const sampleProducts = [
      {
        name: "Nike Air Max",
        description:
          "Premium running shoes with excellent cushioning and support. Perfect for daily workouts and casual wear.",
        price: 129.9,
        image: "/product1.png",
        category: "Shoes",
        stock: 50,
      },
      {
        name: "Adidas Superstar Cap",
        description:
          "Classic baseball cap with iconic Adidas branding. Adjustable fit for maximum comfort.",
        price: 29.9,
        image: "/product2.png",
        category: "Accessories",
        stock: 100,
      },
      {
        name: "Puma Yellow T-Shirt",
        description:
          "Comfortable cotton t-shirt in bright yellow. Breathable fabric perfect for sports and leisure.",
        price: 49.9,
        image: "/product3.png",
        category: "Clothing",
        stock: 75,
      },
    ];

    // Insert sample products
    for (const product of sampleProducts) {
      await pool.query(
        "INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)",
        [
          product.name,
          product.description,
          product.price,
          product.image,
          product.category,
          product.stock,
        ],
      );
    }

    const [products] = await pool.query("SELECT * FROM products");
    res.json({
      success: true,
      message: "Sample products created",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "product-service" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Product service is running on port ${PORT}`);
});
