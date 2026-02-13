#!/bin/bash
# This script runs automatically when EC2 instance first boots
# It installs Docker and sets up the application

set -e  # Stop if any command fails

# Update all system packages to latest versions
sudo yum update -y

# Install Docker (container platform)
sudo yum install -y docker
sudo systemctl start docker  # Start Docker service
sudo systemctl enable docker  # Start Docker on boot
sudo usermod -aG docker ec2-user  # Give ec2-user permission to use Docker

# Install Docker Compose (multi-container tool)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose  # Make it executable
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose  # Create shortcut

# Create directory for application deployment
mkdir -p /home/ec2-user/storygame-deploy
cd /home/ec2-user/storygame-deploy

# Create docker-compose.prod.yml file with application configuration
cat > docker-compose.prod.yml <<'COMPOSE'
services:
  # MongoDB database container
  mongo:
    image: mongo:7  # MongoDB version 7
    restart: unless-stopped  # Auto-restart if crashes
    volumes:
      - mongo_data:/data/db  # Persist database data
    networks:
      - storygame_net  # Connect to app network

  # Python FastAPI backend container
  backend:
    image: sulitha/storygame-backend:latest  # Pull from DockerHub
    restart: unless-stopped  # Auto-restart if crashes
    ports:
      - "8000:8000"  # Expose port 8000 to internet
    environment:
      - PYTHONUNBUFFERED=1  # Show Python logs immediately
      - MONGODB_URI=mongodb://mongo:27017/storygame  # Connect to MongoDB
    depends_on:
      - mongo  # Wait for MongoDB to start first
    networks:
      - storygame_net  # Connect to app network

  # React frontend container
  frontend:
    image: sulitha/storygame-frontend:latest  # Pull from DockerHub
    restart: unless-stopped  # Auto-restart if crashes
    ports:
      - "3000:3000"  # Expose port 3000 to internet
    depends_on:
      - backend  # Wait for backend to start first
    networks:
      - storygame_net  # Connect to app network

# Named volumes for persistent data
volumes:
  mongo_data:  # Stores MongoDB database files

# Network for containers to communicate
networks:
  storygame_net:
    driver: bridge  # Default Docker network driver
COMPOSE

# Give ec2-user ownership of deployment directory
chown -R ec2-user:ec2-user /home/ec2-user/storygame-deploy

# Create script to start the application
cat > /home/ec2-user/start-app.sh <<'START'
#!/bin/bash
cd /home/ec2-user/storygame-deploy
docker-compose pull  # Pull latest images from DockerHub
docker-compose up -d  # Start containers in background
echo "Deployment completed at $(date)" > /home/ec2-user/deployment-status.txt
START

chmod +x /home/ec2-user/start-app.sh  # Make script executable
chown ec2-user:ec2-user /home/ec2-user/start-app.sh  # Give ownership

# Schedule script to run 30 seconds after system reboot
echo "@reboot sleep 30 && /home/ec2-user/start-app.sh" | crontab -u ec2-user -

# Reboot server to apply Docker permissions and start app
sudo reboot
