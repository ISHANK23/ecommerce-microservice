#!/bin/bash

# Setup EC2 for CI/CD Deployment
# Run this script ON YOUR EC2 INSTANCE to prepare it for GitHub Actions deployments

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      Setup EC2 for GitHub Actions CI/CD            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on EC2
if [ ! -f /sys/hypervisor/uuid ] || ! grep -q ec2 /sys/hypervisor/uuid 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: This doesn't appear to be an EC2 instance${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${YELLOW}Step 1: Installing Git${NC}"
sudo yum install git -y 2>/dev/null || sudo apt install git -y 2>/dev/null || echo "Git already installed"

echo ""
echo -e "${YELLOW}Step 2: Cloning repository${NC}"
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -d ~/ecommerce-microservice ]; then
    echo "Directory already exists. Pulling latest changes..."
    cd ~/ecommerce-microservice
    git pull
else
    git clone $REPO_URL ~/ecommerce-microservice
    cd ~/ecommerce-microservice
fi

echo ""
echo -e "${YELLOW}Step 3: Setting up Docker${NC}"
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum install docker -y 2>/dev/null || sudo apt install docker.io -y 2>/dev/null
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
else
    echo "Docker already installed"
fi

echo ""
echo -e "${YELLOW}Step 4: Installing Docker Compose${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose already installed"
fi

echo ""
echo -e "${YELLOW}Step 5: Creating deployment directory structure${NC}"
mkdir -p ~/backups
mkdir -p ~/logs

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Setup Complete!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Log out and log back in for Docker group changes to take effect${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Exit this SSH session: ${YELLOW}exit${NC}"
echo "2. Log back in to your EC2 instance"
echo "3. Set up GitHub Secrets (see instructions below)"
echo ""
echo -e "${GREEN}GitHub Secrets to configure:${NC}"
echo "  • EC2_SSH_KEY - Your EC2 private key (.pem file content)"
echo "  • EC2_HOST - Your EC2 public IP or hostname"
echo "  • EC2_USER - SSH username (ec2-user or ubuntu)"
echo ""
echo "Run this to get your public IP:"
echo "  ${YELLOW}curl -s http://checkip.amazonaws.com${NC}"
