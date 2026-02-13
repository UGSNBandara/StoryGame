# StoryGame - Complete DevOps Project Documentation

## 📋 Project Overview

This is a full-stack web application with a **complete DevOps CI/CD pipeline** demonstrating:
- Containerization with Docker
- Continuous Integration/Deployment with Jenkins
- Infrastructure as Code with Terraform
- Cloud deployment on AWS EC2
- Container orchestration with Docker Compose

**Application**: Time Traveler's Escape - An interactive story game with Egyptian themes

---

## 🏗️ Project Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Jenkins    │────▶│  DockerHub  │
│ (Source)    │     │   (CI/CD)    │     │  (Registry) │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐      ┌─────────────┐
                    │  Local/Dev   │      │  AWS EC2    │
                    │ Environment  │      │ (Production)│
                    └──────────────┘      └─────────────┘
```

---

## 📁 Project Structure

```
StoryGame/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   └── main.py            # API endpoints, CORS config
│   ├── init_db.py             # Database initialization
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile             # Backend container config
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── config.js          # API URL configuration (dynamic)
│   │   ├── components/        # React components
│   │   └── pages/             # Application pages
│   ├── package.json           # Node.js dependencies
│   └── Dockerfile             # Frontend container config
│
├── infra/                      # Terraform infrastructure code
│   ├── main.tf                # AWS resources definition
│   ├── variables.tf           # Input variables
│   ├── terraform.tfvars       # Variable values
│   ├── output.tf              # Output values (IP, URLs)
│   ├── user_data.sh           # EC2 initialization script
│   └── README.md              # Terraform documentation
│
├── docker-compose.yml          # Local development setup
├── docker-compose.prod.yml     # Production setup
├── Jenkinsfile                # CI/CD pipeline definition
└── README.md                  # This file
```

---

## 🛠️ Technologies Used

### **Frontend**
- React 18.2.0 - UI framework
- Vite 4.3.9 - Build tool & dev server
- TailwindCSS 3.4.10 - Styling

### **Backend**
- Python 3.11 - Programming language
- FastAPI - Web framework
- SQLite - Database (lightweight, file-based)
- MongoDB - Optional for features
- Uvicorn - ASGI server

### **DevOps Tools**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Jenkins** - CI/CD automation
- **Terraform** - Infrastructure as Code
- **Git/GitHub** - Version control
- **DockerHub** - Container registry
- **AWS EC2** - Cloud hosting

---

## 🚀 CI/CD Pipeline Flow

### **Jenkins Pipeline Stages:**

1. **Checkout** 
   - Pulls latest code from GitHub repository
   - Branch: `main`

2. **Build Backend**
   - Builds Docker image: `sulitha/storygame-backend:latest`
   - Includes database initialization in CMD

3. **Build Frontend**
   - Builds Docker image: `sulitha/storygame-frontend:latest`
   - Configures dynamic API URL based on environment

4. **Push Images**
   - Authenticates with DockerHub
   - Pushes both images to registry

5. **Deploy via SSH**
   - Connects to localhost deployment server
   - Pulls latest images from DockerHub
   - Restarts containers with new images

6. **Post Actions**
   - Cleans up unused Docker images
   - Displays deployment instructions

---

## ☁️ AWS Infrastructure (Terraform)

### **Resources Created:**

1. **Security Group** (`aws_security_group.storygame_sg`)
   - Ports: 22 (SSH), 3000 (Frontend), 8000 (Backend)
   - Allows inbound traffic from anywhere

2. **EC2 Instance** (`aws_instance.storygame`)
   - Instance type: `t3.micro` (free tier eligible)
   - AMI: Amazon Linux 2023 (auto-fetched)
   - Storage: 10GB gp3 volume
   - User data: Automated setup script

3. **Default VPC** (auto-detected)
   - Uses AWS default VPC for simplicity

### **Terraform Workflow:**

```bash
# Initialize Terraform
terraform init

# Preview infrastructure changes
terraform plan

# Create infrastructure
terraform apply

# Destroy infrastructure (cleanup)
terraform destroy
```

### **EC2 Initialization (user_data.sh):**

When EC2 instance launches, it automatically:
1. Updates system packages
2. Installs Docker & Docker Compose
3. Creates deployment directory
4. Downloads docker-compose.prod.yml
5. Schedules container startup on reboot

---

## 🐳 Docker Configuration

### **Backend Dockerfile:**
- Base: `python:3.11-slim`
- Creates `/app/data` for SQLite
- Runs `init_db.py` on startup
- Exposes port 8000

### **Frontend Dockerfile:**
- Base: `node:20-alpine`
- Uses `npm ci` for reproducible builds
- Runs Vite dev server with `--host 0.0.0.0`
- Exposes port 3000

### **docker-compose.prod.yml:**
```yaml
services:
  mongo:      # MongoDB database
  backend:    # Python FastAPI (port 8000)
  frontend:   # React app (port 3000)

volumes:
  mongo_data:  # Persistent MongoDB data
  sqlite_data: # Persistent SQLite data

networks:
  storygame_net: # Internal network
```

---

## 🔄 Deployment Process

### **Development (Local):**
```bash
docker-compose up --build
```
Access: http://localhost:3000

### **Production (AWS):**

**1. Infrastructure Setup (One-time):**
```bash
cd infra
terraform apply
```

**2. Initial Deployment:**
```bash
# Connect to EC2
aws ec2-instance-connect ssh --instance-id i-0a569caabdef1aa2e

# Start containers
cd /home/ec2-user/storygame-deploy
docker-compose -f docker-compose.prod.yml up -d
```

**3. Updates (via Jenkins):**
- Push code to GitHub
- Jenkins automatically builds and pushes images
- Manually pull and restart on AWS

---

## 🔧 Key Technical Configurations

### **1. CORS Configuration (backend/app/main.py):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **2. Dynamic API URL (frontend/src/config.js):**
```javascript
const getApiUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  return `http://${window.location.hostname}:8000`;
};
```

### **3. Database Initialization (backend/init_db.py):**
- Creates SQLite database at `/app/data/storygame.db`
- Creates tables: users, levels, user_progress
- Inserts sample data for 5 game levels

---

## 📊 Monitoring & Verification

### **Check Docker Containers:**
```bash
docker ps
```
Expected: 3 containers running (mongo, backend, frontend)

### **View Logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Test Backend API:**
```bash
curl http://13.48.46.226:8000/
# Expected: {"message": "Welcome to the User Management API"}
```

### **Access Frontend:**
Browse to: http://13.48.46.226:3000

---

## 🎯 DevOps Best Practices Demonstrated

1. **Infrastructure as Code** - Terraform manages all AWS resources
2. **Containerization** - Application runs consistently everywhere
3. **CI/CD Automation** - Jenkins automates build and deployment
4. **Version Control** - All code tracked in Git
5. **Container Registry** - Images stored in DockerHub
6. **Environment Separation** - Dev (localhost) vs Prod (AWS)
7. **Configuration Management** - Dynamic configs for different environments
8. **Security** - SSH keys, credential management, security groups
9. **Scalability** - Easy to replicate and scale
10. **Documentation** - Complete project documentation

---

## 🐛 Troubleshooting

### **Issue: Containers not starting**
```bash
# Check logs
docker-compose logs

# Restart containers
docker-compose down
docker-compose up -d
```

### **Issue: Database errors**
```bash
# Re-initialize database
docker exec -it storygame-deploy-backend-1 python init_db.py
```

### **Issue: CORS errors**
- Verify backend allows all origins
- Check API_URL in frontend config

### **Issue: Can't connect to AWS**
```bash
# Test connection
aws ec2-instance-connect ssh --instance-id i-0a569caabdef1aa2e

# Check security group allows port 3000, 8000
```

---

## 💰 AWS Cost Management

- **EC2 t3.micro**: 750 hours/month free (first 12 months)
- **EBS Storage**: 30GB free tier
- **Data Transfer**: 15GB outbound free

**Always destroy resources when done:**
```bash
terraform destroy
```

---

## 📝 Viva Questions & Answers

### **Q: Why use Docker?**
A: Ensures consistency across development, staging, and production. "Works on my machine" problems are eliminated.

### **Q: Why Jenkins for CI/CD?**
A: Industry-standard automation tool. Automates repetitive tasks, reduces human error, enables rapid deployment.

### **Q: Why Terraform?**
A: Infrastructure as Code allows version-controlled, reproducible infrastructure. Easy to create/destroy environments.

### **Q: Why separate dev and prod deployments?**
A: Safety - prevents accidental production changes. Industry standard practice for controlled production releases.

### **Q: Why DockerHub?**
A: Central registry for Docker images. Enables image versioning and distribution across environments.

### **Q: Why MongoDB + SQLite?**
A: SQLite for simple data (users, progress), MongoDB for future features. Demonstrates multi-database architecture.

### **Q: Explain the data flow:**
A: User → Frontend (React) → Backend API (FastAPI) → Database (SQLite/MongoDB) → Response to Frontend

### **Q: How does the pipeline ensure quality?**
A: Automated builds catch errors early. Consistent Docker images ensure reliability. Manual production deployment adds approval gate.

---

## 🎓 Learning Outcomes

✅ **Containerization** - Docker, Docker Compose  
✅ **CI/CD** - Jenkins pipeline automation  
✅ **Cloud Computing** - AWS EC2 deployment  
✅ **Infrastructure as Code** - Terraform  
✅ **Version Control** - Git, GitHub  
✅ **Full Stack Development** - React + FastAPI  
✅ **DevOps Practices** - Automation, monitoring, deployment strategies  
✅ **Networking** - Security groups, ports, CORS  
✅ **Database Management** - SQLite, MongoDB  
✅ **Container Registry** - DockerHub integration  

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify containers: `docker ps`
3. Review Terraform state: `terraform show`
4. Check Jenkins console output

---

## 🏆 Project Success Criteria

✅ Application runs locally via Docker Compose  
✅ Jenkins pipeline builds and pushes images automatically  
✅ Terraform provisions AWS infrastructure  
✅ Application deployed and accessible on AWS  
✅ Complete documentation provided  
✅ Demonstrates end-to-end DevOps workflow  

---

**Project Status**: ✅ Complete and Deployed  
**AWS Instance**: http://13.48.46.226:3000  
**Repository**: GitHub (StoryGame)  
**Container Images**: DockerHub (sulitha/storygame-*)
