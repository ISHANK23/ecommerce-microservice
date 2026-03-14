#!/bin/bash

# Create ECS Services
# This script creates ECS services for all microservices

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Creating ECS Services${NC}"
echo ""

read -p "Enter AWS Region: " AWS_REGION
read -p "Enter ECS Cluster Name [ecommerce-cluster]: " CLUSTER_NAME
CLUSTER_NAME=${CLUSTER_NAME:-ecommerce-cluster}

export AWS_REGION

# Services to create (order matters - infrastructure first)
declare -a services=("mysql" "kafka" "product-service" "payment-service" "order-service" "email-service" "analytic-service" "client")

echo ""
echo -e "${YELLOW}Creating services in order...${NC}"

for service in "${services[@]}"; do
    echo ""
    echo -e "${YELLOW}Creating service: $service${NC}"
    
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $service \
        --task-definition $service \
        --desired-count 1 \
        --launch-type EC2 \
        --region $AWS_REGION \
        2>/dev/null && echo -e "${GREEN}✓ $service created${NC}" || echo -e "${YELLOW}Service $service already exists or failed${NC}"
    
    # Wait a bit between infrastructure services
    if [ "$service" = "mysql" ] || [ "$service" = "kafka" ]; then
        echo "Waiting 15 seconds for $service to start..."
        sleep 15
    fi
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            All Services Created!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Check service status:${NC}"
echo "  aws ecs list-services --cluster $CLUSTER_NAME --region $AWS_REGION"
echo ""
echo -e "${YELLOW}View service details:${NC}"
echo "  aws ecs describe-services --cluster $CLUSTER_NAME --services client --region $AWS_REGION"
echo ""
echo -e "${YELLOW}Don't forget to seed the database:${NC}"
echo "  curl -X POST http://YOUR_EC2_IP:8001/api/products/seed"
