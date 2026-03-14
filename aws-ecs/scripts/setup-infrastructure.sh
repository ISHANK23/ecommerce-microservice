#!/bin/bash

# Setup AWS Infrastructure for ECS on EC2
# This script creates the necessary AWS infrastructure

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Setting up AWS Infrastructure for ECS on EC2${NC}"
echo ""

read -p "Enter AWS Region (e.g., us-east-1): " AWS_REGION
read -p "Enter your SSH key pair name (will create if doesn't exist): " KEY_PAIR_NAME
read -p "Enter cluster name [ecommerce-cluster]: " CLUSTER_NAME
CLUSTER_NAME=${CLUSTER_NAME:-ecommerce-cluster}

export AWS_REGION

echo ""
echo -e "${YELLOW}Step 1: Create Key Pair (if needed)${NC}"
aws ec2 create-key-pair \
    --key-name $KEY_PAIR_NAME \
    --region $AWS_REGION \
    --query 'KeyMaterial' \
    --output text > ${KEY_PAIR_NAME}.pem 2>/dev/null && chmod 400 ${KEY_PAIR_NAME}.pem || echo "Key pair already exists"

echo ""
echo -e "${YELLOW}Step 2: Get Default VPC${NC}"
VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=is-default,Values=true" \
    --query 'Vpcs[0].VpcId' \
    --output text \
    --region $AWS_REGION)
echo "Using VPC: $VPC_ID"

echo ""
echo -e "${YELLOW}Step 3: Create Security Group${NC}"
SG_ID=$(aws ec2 create-security-group \
    --group-name ecommerce-ecs-sg \
    --description "Security group for ECS microservices" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null) || SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=ecommerce-ecs-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region $AWS_REGION)

echo "Security Group ID: $SG_ID"

# Add inbound rules
echo "Adding security group rules..."
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "SSH rule exists"

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "Port 3000 rule exists"

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 8000-8001 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "Port 8000-8001 rule exists"

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "Port 8080 rule exists"

echo ""
echo -e "${YELLOW}Step 4: Create ECS Cluster${NC}"
aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $AWS_REGION 2>/dev/null || echo "Cluster already exists"

echo ""
echo -e "${YELLOW}Step 5: Get ECS-Optimized AMI${NC}"
AMI_ID=$(aws ssm get-parameters \
    --names /aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id \
    --region $AWS_REGION \
    --query 'Parameters[0].Value' \
    --output text)
echo "ECS-Optimized AMI: $AMI_ID"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Infrastructure Setup Complete!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration Summary:${NC}"
echo "Region: $AWS_REGION"
echo "VPC ID: $VPC_ID"
echo "Security Group ID: $SG_ID"
echo "Key Pair: $KEY_PAIR_NAME"
echo "ECS Cluster: $CLUSTER_NAME"
echo "AMI ID: $AMI_ID"
echo ""
echo -e "${GREEN}Save this information for the next steps!${NC}"
echo ""
echo "To launch an EC2 instance, run:"
echo "  ./aws-ecs/scripts/launch-ec2.sh"
