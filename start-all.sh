#!/bin/bash

# E-commerce Microservices Startup Script

echo "🚀 Starting E-commerce Microservices..."

# Start Kafka
echo "📦 Starting Kafka..."
cd services/kafka
docker-compose up -d
cd ../..

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to initialize (5 seconds)..."
sleep 5

# Start Payment Service
echo "💳 Starting Payment Service..."
cd services/payment-service
node index.js &
PAYMENT_PID=$!
cd ../..

# Start Order Service
echo "📋 Starting Order Service..."
cd services/order-service
node index.js &
ORDER_PID=$!
cd ../..

# Start Email Service
echo "📧 Starting Email Service..."
cd services/email-service
node index.js &
EMAIL_PID=$!
cd ../..

# Start Analytics Service
echo "📊 Starting Analytics Service..."
cd services/analytic-service
node index.js &
ANALYTICS_PID=$!
cd ../..

# Start Product Service
echo "🛍️  Starting Product Service..."
cd services/product-service
node index.js &
PRODUCT_PID=$!
cd ../..

# Wait a bit for backend services to initialize
sleep 3

# Start Client (Frontend)
echo "🎨 Starting Client (Frontend)..."
cd services/client
npm run dev &
CLIENT_PID=$!
cd ../..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Services running on:"
echo "   - Payment Service:  http://localhost:8000"
echo "   - Product Service:  http://localhost:8001"
echo "   - Kafka UI:         http://localhost:8080"
echo "   - Client (Frontend): http://localhost:3000"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $PAYMENT_PID $ORDER_PID $EMAIL_PID $ANALYTICS_PID $PRODUCT_PID $CLIENT_PID 2>/dev/null
    cd services/kafka
    docker-compose down
    cd ../..
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT TERM

# Wait for background processes
wait
