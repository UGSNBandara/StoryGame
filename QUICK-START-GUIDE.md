# 🚀 Quick Start Guide: Build Your Own DevOps Project

Follow this guide to create a complete DevOps CI/CD pipeline project from scratch. Share this with friends!

---

## 📋 What You'll Build

A full-stack web application with:
- ✅ Docker containerization
- ✅ Jenkins CI/CD pipeline
- ✅ AWS cloud deployment
- ✅ Terraform infrastructure
- ✅ Complete automation

**Time Required**: 2-3 hours  
**Difficulty**: Intermediate  
**Cost**: Free (AWS Free Tier)

---

## 🛠️ Prerequisites

### **Required Software:**

1. **WSL2 (Windows Subsystem for Linux)**
   ```powershell
   # In PowerShell (Admin)
   wsl --install
   ```

2. **Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Enable WSL2 integration

3. **Git**
   ```bash
   # In WSL
   sudo apt update
   sudo apt install git
   ```

4. **AWS CLI**
   ```bash
   # In WSL
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

5. **Terraform**
   ```bash
   # In WSL
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   ```

6. **Jenkins**
   ```bash
   # In WSL
   sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
   echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
   sudo apt-get update
   sudo apt-get install jenkins
   sudo systemctl start jenkins
   ```

### **Required Accounts:**

1. **GitHub**: https://github.com (Free)
2. **DockerHub**: https://hub.docker.com (Free)
3. **AWS**: https://aws.amazon.com (Free Tier)

---

## 📚 Step-by-Step Instructions

### **Step 1: Clone the Project**

```bash
# In WSL terminal
cd ~
git clone https://github.com/UGSNBandara/StoryGame.git
cd StoryGame
```

### **Step 2: Test Locally**

```bash
# Start the application
docker compose up --build

# Wait 2 minutes, then open browser:
# http://localhost:3000
```

**Expected**: Application running with frontend and backend

```bash
# Stop containers
docker compose down
```

### **Step 3: Setup DockerHub**

1. Create account at https://hub.docker.com
2. Create repository: `your-username/storygame-backend`
3. Create repository: `your-username/storygame-frontend`

```bash
# Login to DockerHub
docker login

# Update image names in files:
# - Jenkinsfile (DOCKERHUB_REPO)
# - docker-compose.prod.yml (image names)
```

### **Step 4: Setup Jenkins**

```bash
# Start Jenkins
sudo systemctl start jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Open Jenkins: http://localhost:8080
# Install suggested plugins
```

**Configure Jenkins:**

1. **Install Docker Plugin**
   - Manage Jenkins → Plugins → Available
   - Search: "Docker Pipeline"
   - Install without restart

2. **Add DockerHub Credentials**
   - Manage Jenkins → Credentials → Global
   - Add Credentials:
     - Kind: Username with password
     - ID: `dockerhub-credentials`
     - Username: Your DockerHub username
     - Password: Your DockerHub password

3. **Create Pipeline Job**
   - New Item → Pipeline
   - Name: `StoryGame-CICD`
   - Pipeline → Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your GitHub repo URL
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

### **Step 5: Update Configuration Files**

#### **Jenkinsfile** (line 6):
```groovy
DOCKERHUB_REPO = 'your-username/storygame'
```

#### **docker-compose.prod.yml** (lines 11, 22):
```yaml
backend:
  image: your-username/storygame-backend:latest

frontend:
  image: your-username/storygame-frontend:latest
```

### **Step 6: Setup AWS**

1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Sign up for free tier

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter AWS Access Key ID
   # Enter AWS Secret Access Key
   # Default region: eu-north-1 (or your preferred region)
   # Default output format: json
   ```

3. **Create SSH Key Pair**
   ```bash
   # In AWS Console → EC2 → Key Pairs
   # Create key pair: "storygame-key"
   # Download the .pem file
   ```

### **Step 7: Deploy to AWS with Terraform**

```bash
cd infra

# Update terraform.tfvars with your values:
# - aws_region
# - instance_type
# - key_name

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Create infrastructure
terraform apply
# Type: yes
```

**Wait 5 minutes for setup to complete**

Terraform will output:
- `instance_public_ip` - Your server IP
- `frontend_url` - Frontend URL
- `backend_url` - Backend API URL
- `ssh_command` - SSH command to connect

### **Step 8: Deploy Application to AWS**

```bash
# Connect to AWS instance
aws ec2-instance-connect ssh --instance-id YOUR_INSTANCE_ID

# Inside AWS instance:
cd /home/ec2-user/storygame-deploy
docker-compose -f docker-compose.prod.yml up -d

# Check containers
docker ps
# Should see: mongo, backend, frontend

# Exit
exit
```

### **Step 9: Test Your Pipeline**

1. Make a small code change
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to Jenkins → Your Job → Build Now
4. Watch the pipeline run

**Pipeline will:**
- ✅ Checkout code
- ✅ Build Docker images
- ✅ Push to DockerHub
- ✅ Deploy to localhost

5. Manually update AWS (best practice):
   ```bash
   aws ec2-instance-connect ssh --instance-id YOUR_INSTANCE_ID
   cd /home/ec2-user/storygame-deploy
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d --force-recreate
   exit
   ```

### **Step 10: Access Your Application**

- **Local**: http://localhost:3000
- **AWS**: http://YOUR_AWS_IP:3000

---

## 🎨 Customize for Your Project

### **1. Change Application:**
- Replace frontend code in `frontend/src/`
- Replace backend code in `backend/app/`
- Keep Dockerfiles and docker-compose.yml

### **2. Use Your Own Git Repo:**
```bash
# Create new GitHub repo
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### **3. Change Project Name:**
Update in:
- `package.json` (frontend)
- `docker-compose.yml`
- `Jenkinsfile` (DOCKERHUB_REPO)
- Terraform `variables.tf`

---

## 🐛 Common Issues & Solutions

### **Issue 1: Docker build fails**
```bash
# Solution: Restart Docker Desktop
# In Docker Desktop: Settings → Reset → Reset to factory defaults
```

### **Issue 2: Jenkins can't connect to Docker**
```bash
# Solution: Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### **Issue 3: Terraform can't create EC2**
```bash
# Solution: Check AWS credentials
aws sts get-caller-identity

# If error, reconfigure:
aws configure
```

### **Issue 4: Can't access AWS application**
```bash
# Solution: Check security group allows ports
# AWS Console → EC2 → Security Groups
# Ensure inbound rules allow:
# - Port 22 (SSH)
# - Port 3000 (Frontend)
# - Port 8000 (Backend)
```

### **Issue 5: CORS errors in browser**
- Check `backend/app/main.py` has `allow_origins=["*"]`
- Check `frontend/src/config.js` uses correct API URL

---

## 📖 Learn More

### **Docker:**
- Tutorial: https://docs.docker.com/get-started/
- Commands: `docker ps`, `docker logs`, `docker exec`

### **Jenkins:**
- Documentation: https://www.jenkins.io/doc/
- Pipeline syntax: https://www.jenkins.io/doc/book/pipeline/

### **Terraform:**
- Tutorial: https://learn.hashicorp.com/terraform
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws

### **AWS:**
- EC2 Guide: https://docs.aws.amazon.com/ec2/
- Free Tier: https://aws.amazon.com/free/

---

## 🎯 What to Tell Your AI Assistant

Copy this prompt to your AI assistant (ChatGPT, Claude, etc.):

```
I want to create a DevOps project with:
1. A simple web application (React frontend + Python/Node backend)
2. Docker containerization for both frontend and backend
3. Jenkins CI/CD pipeline that:
   - Builds Docker images
   - Pushes to DockerHub
   - Deploys automatically
4. Terraform code to deploy to AWS EC2
5. Complete project structure and documentation

Please help me:
- Set up the project structure
- Create Dockerfiles for frontend and backend
- Write a Jenkinsfile for CI/CD
- Create Terraform files for AWS deployment
- Configure everything to work together
```

---

## ✅ Checklist

Before presenting your project:

- [ ] Application runs locally via `docker compose up`
- [ ] Jenkins pipeline completes successfully
- [ ] Images pushed to DockerHub
- [ ] Terraform creates AWS infrastructure
- [ ] Application accessible on AWS
- [ ] Can demonstrate full deployment workflow
- [ ] All files committed to GitHub
- [ ] Documentation complete

---

## 🎓 What You'll Learn

✅ Docker & Containerization  
✅ CI/CD with Jenkins  
✅ Infrastructure as Code (Terraform)  
✅ Cloud Computing (AWS)  
✅ Version Control (Git)  
✅ Container Orchestration (Docker Compose)  
✅ DevOps Best Practices  
✅ Automation & Deployment  

---

## 💡 Tips for Success

1. **Start Simple**: Get local Docker working first
2. **Test Each Step**: Don't skip ahead
3. **Document Everything**: Take screenshots
4. **Use Free Tier**: AWS offers 750 hours/month free
5. **Clean Up**: Run `terraform destroy` when done
6. **Ask Questions**: Use AI assistants for troubleshooting
7. **Practice**: Deploy multiple times to learn

---

## 🎬 Demo Script for Presentation

1. **Show Project Structure** (2 min)
   - Explain folder organization
   - Show Dockerfiles, Jenkinsfile, Terraform

2. **Run Locally** (3 min)
   - `docker compose up`
   - Show application working
   - Demonstrate features

3. **Jenkins Pipeline** (5 min)
   - Show Jenkinsfile
   - Trigger build
   - Watch pipeline stages execute
   - Show DockerHub images

4. **AWS Deployment** (5 min)
   - Show Terraform code
   - Explain infrastructure
   - Access AWS application
   - Show it working in cloud

5. **Code Change Demo** (5 min)
   - Make small change
   - Push to GitHub
   - Jenkins auto-builds
   - Deploy to AWS
   - Show updated application

---

## 🏆 Success Criteria

Your project is complete when:

✅ GitHub repository with all code  
✅ DockerHub images publicly available  
✅ Jenkins pipeline runs successfully  
✅ AWS infrastructure created via Terraform  
✅ Application accessible on internet  
✅ Complete documentation provided  
✅ Can answer questions about any component  

---

## 📞 Getting Help

If stuck, search for:
- "Docker [your issue]"
- "Jenkins pipeline [your issue]"
- "Terraform AWS [your issue]"

Or ask your AI assistant:
```
I'm following a DevOps tutorial and stuck at [describe issue].
Here's my error: [paste error]
Here's my code: [paste relevant code]
How do I fix this?
```

---

## 🎉 Congratulations!

You now have a production-ready DevOps project demonstrating industry-standard practices!

**Share this guide**: Help others learn DevOps!

**Next Steps**:
- Add testing stages to Jenkins
- Implement blue-green deployment
- Add monitoring with Prometheus
- Set up logging with ELK stack
- Explore Kubernetes

---

**Good luck with your DevOps journey! 🚀**
