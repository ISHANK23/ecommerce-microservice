#!/bin/bash

# Stop all microservices

echo "🛑 Stopping all services..."

# Stop Node.js processes
echo "Stopping Node.js services..."
pkill -f "node index.js"
pkill -f "next dev"

# Stop Kafka
echo "Stopping Kafka..."
cd services/kafka
docker-compose down
cd ../..

echo "✅ All services stopped"
