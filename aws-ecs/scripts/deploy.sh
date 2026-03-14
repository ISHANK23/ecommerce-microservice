#!/bin/bash

# ECS on EC2 Deployment Script for E-commerce Microservices
# This script deploys your microservices to AWS ECS using EC2 instances (Free Tier eligible)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ECS EC2 Deployment - E-commerce Microservices   ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it with: brew install awscli"
    exit 1
fi

# Get configuration
read -p "Enter AWS Region (e.g., us-east-1): " AWS_REGION
export AWS_REGION

echo -e "${YELLOW}Getting AWS Account ID...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}Account ID: $AWS_ACCOUNT_ID${NC}"

# Update task definitions with actual values
echo -e "${YELLOW}Updating task definitions with your AWS details...${NC}"
for file in aws-ecs/task-definitions/*.json; do
    sed -i.bak "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" "$file"
    sed -i.bak "s/REGION/$AWS_REGION/g" "$file"
    rm "${file}.bak"
done

echo -e "${GREEN}Step 1: Create ECR Repositories${NC}"
services=("client" "product-service" "payment-service" "order-service" "email-service" "analytic-service")

for service in "${services[@]}"; do
    echo "Creating ECR repository for $service..."
    aws ecr create-repository \
        --repository-name ecommerce/$service \
        --region $AWS_REGION \
        2>/dev/null || echo "Repository ecommerce/$service already exists"
done

echo ""
echo -e "${GREEN}Step 2: Build and Push Docker Images to ECR${NC}"

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push each service
for service in "${services[@]}"; do
    echo -e "${YELLOW}Building and pushing $service...${NC}"
    
    SERVICE_PATH="services/$service"
    ECR_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommerce/$service"
    
    docker build -t ecommerce/$service $SERVICE_PATH
    docker tag ecommerce/$service:latest $ECR_REPO:latest
    docker push $ECR_REPO:latest
    
    echo -e "${GREEN}✓ $service pushed successfully${NC}"
done

echo ""
echo -e "${GREEN}Step 3: Create ECS Cluster${NC}"
CLUSTER_NAME="ecommerce-cluster"

aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $AWS_REGION \
    2>/dev/null || echo "Cluster already exists"

echo ""
echo -e "${GREEN}Step 4: Register Task Definitions${NC}"

for file in aws-ecs/task-definitions/*.json; do
    service_name=$(basename "$file" .json)
    echo "Registering task definition for $service_name..."
    aws ecs register-task-definition \
        --cli-input-json file://$file \
        --region $AWS_REGION
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Deployment Complete!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Launch an EC2 instance with ECS-optimized AMI"
echo "2. Use the AWS Console or run: ./aws-ecs/scripts/create-services.sh"
echo "3. Your services will be available on the EC2 instance IP"
echo ""
echo -e "${GREEN}Cluster Name: $CLUSTER_NAME${NC}"
echo -e "${GREEN}Region: $AWS_REGION${NC}"
