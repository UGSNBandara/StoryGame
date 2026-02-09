#!/bin/bash
set -e

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Create deployment directory
mkdir -p /home/ec2-user/storygame-deploy
cd /home/ec2-user/storygame-deploy

# Create docker-compose.prod.yml
cat > docker-compose.prod.yml <<'COMPOSE'
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - storygame_net

  backend:
    image: sulitha/storygame-backend:latest
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - MONGODB_URI=mongodb://mongo:27017/storygame
    depends_on:
      - mongo
    networks:
      - storygame_net

  frontend:
    image: sulitha/storygame-frontend:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - storygame_net

volumes:
  mongo_data:

networks:
  storygame_net:
    driver: bridge
COMPOSE

# Set permissions
chown -R ec2-user:ec2-user /home/ec2-user/storygame-deploy

# Pull and start containers (run as ec2-user after reboot for docker group to take effect)
cat > /home/ec2-user/start-app.sh <<'START'
#!/bin/bash
cd /home/ec2-user/storygame-deploy
docker-compose pull
docker-compose up -d
echo "Deployment completed at $(date)" > /home/ec2-user/deployment-status.txt
START

chmod +x /home/ec2-user/start-app.sh
chown ec2-user:ec2-user /home/ec2-user/start-app.sh

# Schedule to run after user login (docker group membership active)
echo "@reboot sleep 30 && /home/ec2-user/start-app.sh" | crontab -u ec2-user -

# Reboot to apply docker group membership
sudo reboot
