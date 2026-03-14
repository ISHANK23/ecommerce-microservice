#!/bin/bash

# Launch EC2 Instance for ECS
# This script launches a t2.micro (or t3.micro) EC2 instance with ECS agent

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Launch EC2 Instance for ECS${NC}"
echo ""

read -p "Enter AWS Region: " AWS_REGION
read -p "Enter ECS Cluster Name: " CLUSTER_NAME
read -p "Enter Security Group ID: " SG_ID
read -p "Enter Key Pair Name: " KEY_PAIR_NAME
read -p "Instance Type [t2.micro]: " INSTANCE_TYPE
INSTANCE_TYPE=${INSTANCE_TYPE:-t2.micro}

export AWS_REGION

# Get ECS-Optimized AMI
echo -e "${YELLOW}Getting ECS-Optimized AMI...${NC}"
AMI_ID=$(aws ssm get-parameters \
    --names /aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id \
    --region $AWS_REGION \
    --query 'Parameters[0].Value' \
    --output text)
echo "AMI: $AMI_ID"

# Create IAM role for ECS (if not exists)
echo -e "${YELLOW}Setting up IAM role...${NC}"
ROLE_NAME="ecsInstanceRole"

# Create trust policy
cat > /tmp/ecs-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
    2>/dev/null || echo "Role already exists"

# Attach managed policy
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role \
    2>/dev/null || echo "Policy already attached"

# Create instance profile
aws iam create-instance-profile \
    --instance-profile-name $ROLE_NAME \
    2>/dev/null || echo "Instance profile already exists"

# Add role to instance profile
aws iam add-role-to-instance-profile \
    --instance-profile-name $ROLE_NAME \
    --role-name $ROLE_NAME \
    2>/dev/null || echo "Role already in instance profile"

# Wait a bit for IAM to propagate
echo "Waiting for IAM role to propagate..."
sleep 10

# User data script to configure ECS agent
cat > /tmp/user-data.sh <<EOF
#!/bin/bash
echo ECS_CLUSTER=$CLUSTER_NAME >> /etc/ecs/ecs.config
echo ECS_ENABLE_TASK_IAM_ROLE=true >> /etc/ecs/ecs.config
EOF

# Launch instance
echo -e "${YELLOW}Launching EC2 instance...${NC}"
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_PAIR_NAME \
    --security-group-ids $SG_ID \
    --iam-instance-profile Name=$ROLE_NAME \
    --user-data file:///tmp/user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=ecommerce-ecs-instance}]" \
    --region $AWS_REGION \
    --query 'Instances[0].InstanceId' \
    --output text)

echo -e "${GREEN}Instance launched: $INSTANCE_ID${NC}"
echo ""
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $AWS_REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           EC2 Instance Launched!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo ""
echo -e "${YELLOW}To SSH into the instance:${NC}"
echo "  ssh -i $KEY_PAIR_NAME.pem ec2-user@$PUBLIC_IP"
echo ""
echo -e "${YELLOW}Wait a few minutes for the instance to join the ECS cluster, then run:${NC}"
echo "  ./aws-ecs/scripts/create-services.sh"
echo ""
echo -e "${GREEN}Access your application:${NC}"
echo "  Frontend: http://$PUBLIC_IP:3000"
echo "  Product API: http://$PUBLIC_IP:8001"
echo "  Kafka UI: http://$PUBLIC_IP:8080"
