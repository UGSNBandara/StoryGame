# StoryGame AWS Deployment with Terraform

Simple Terraform setup to deploy StoryGame to AWS EC2 (Free Tier).

## Prerequisites

1. AWS account with free tier access
2. Terraform installed
3. SSH key pair created in AWS (named `storygame-key`)

## Setup Steps

### 1. Get Your VPC and Subnet IDs

```bash
# In WSL terminal
aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text
aws ec2 describe-subnets --filters "Name=vpc-id,Values=YOUR_VPC_ID" --query 'Subnets[?MapPublicIpOnLaunch==`true`].SubnetId' --output text
```

### 2. Update terraform.tfvars

Edit `terraform.tfvars` and fill in:
- `vpc_id`: Your VPC ID from step 1
- `subnet_id`: Your PUBLIC subnet ID from step 1  
- `my_ip_cidr`: Your public IP (get it: `curl ifconfig.me`) then add `/32`

Example:
```hcl
vpc_id     = "vpc-0da17bdc7d2173e8e"
subnet_id  = "subnet-0abc123def456789"
my_ip_cidr = "203.45.67.89/32"
```

### 3. Deploy

```bash
cd ~/storygame-aws/infra

# Clean old state
rm -rf .terraform terraform.tfstate*

# Initialize
terraform init

# Deploy
terraform apply
# Type: yes
```

### 4. Wait & Access

- Wait **5 minutes** for setup to complete
- Frontend: `http://<PUBLIC-IP>:3000`
- Backend: `http://<PUBLIC-IP>:8000`

### 5. Verify Deployment

```bash
# SSH into instance
ssh -i storygame-key.pem ec2-user@<PUBLIC-IP>

# Check containers
docker ps

# Check logs
cd storygame-deploy
docker-compose logs
```

## Cleanup

```bash
terraform destroy
# Type: yes
```

## Files

- **main.tf** - Infrastructure definition
- **variables.tf** - Variable definitions
- **terraform.tfvars** - Your configuration values
- **output.tf** - Shows URLs after deployment
- **user_data.sh** - EC2 startup script
- **docker-compose.prod.yml** - Docker compose config (reference)

## Troubleshooting

**Containers not running?**
```bash
ssh -i storygame-key.pem ec2-user@<IP>
/home/ec2-user/start-app.sh
```

**Can't connect?**
- Check security group in AWS Console
- Verify your IP is correct in `my_ip_cidr`
- Wait 5 minutes after deployment
