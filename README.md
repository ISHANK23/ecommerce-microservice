# E-commerce Microservices Platform

A microservices-based e-commerce platform with Kafka event streaming.

## 🏗️ Architecture

- **Frontend**: Next.js client
- **Services**:
  - Payment Service (Port 8000)
  - Product Service (Port 8001)
  - Order Service
  - Email Service
  - Analytics Service
- **Message Broker**: Apache Kafka with Kafka UI (Port 8080)
- **Database**: MySQL for products

## 🚀 Quick Start

### Option 1: Using NPM Scripts (Recommended)

```bash
# Install dependencies for all services
npm run install-all

# Start Kafka and all services
npm run dev:all

# Or start services without Kafka (if already running)
npm run dev

# Stop all services
npm run stop
```

### Option 2: Using Shell Script

```bash
# Make scripts executable
chmod +x start-all.sh stop-all.sh

# Start all services
./start-all.sh

# Stop all services (in another terminal or Ctrl+C)
./stop-all.sh
```

### Option 3: Manual Start

```bash
# 1. Start Kafka
cd services/kafka
docker-compose up -d
cd ../..

# 2. Create Kafka topics (one time)
cd services/kafka
node admin.js
cd ../..

# 3. Start each service in separate terminals
cd services/payment-service && node index.js
cd services/order-service && node index.js
cd services/email-service && node index.js
cd services/analytic-service && node index.js
cd services/product-service && node index.js
cd services/client && npm run dev
```

## 📋 Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- MySQL (for product service)

## 🔧 Setup

### 1. Install MySQL

```bash

# Create database
mysql -u root -p
CREATE DATABASE ecommerce;
```

### 2. Configure Product Service

Edit `services/product-service/.env`:

```
PORT=8001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecommerce
```

### 3. Seed Product Data (Optional)

```bash
curl -X POST http://localhost:8001/api/products/seed
```

## 🌐 Service URLs

| Service         | URL                   |
| --------------- | --------------------- |
| Frontend        | http://localhost:3000 |
| Payment Service | http://localhost:8000 |
| Product Service | http://localhost:8001 |
| Kafka UI        | http://localhost:8080 |


