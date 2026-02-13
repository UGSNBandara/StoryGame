# This is the main Terraform configuration file
# It creates all AWS resources needed for the application

# Terraform settings - which version and providers to use
terraform {
  required_version = ">= 1.5.0"  # Terraform version 1.5 or higher
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # Use AWS provider
      version = "~> 5.0"  # Version 5.x
    }
  }
}

# Configure AWS provider with region from variables
provider "aws" {
  region = var.aws_region  # Use region from variables.tf
}

# Automatically find the latest Amazon Linux 2023 image (AMI)
data "aws_ami" "al2023" {
  most_recent = true  # Get the newest version
  owners      = ["amazon"]  # Official Amazon images only

  filter {
    name   = "name"  # Filter by name pattern
    values = ["al2023-ami-2023.*-x86_64"]  # Amazon Linux 2023
  }
}

# Get the default VPC (Virtual Private Cloud) in your AWS account
data "aws_vpc" "default" {
  default = true  # Use the default VPC
}

# Create a firewall (security group) to control traffic
resource "aws_security_group" "storygame_sg" {
  name        = "storygame-security-group"
  description = "Security group for StoryGame application"
  vpc_id      = data.aws_vpc.default.id  # Attach to default VPC

  # Allow SSH connections (port 22) from anywhere
  ingress {
    description = "SSH"
    from_port   = 22  # Port 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # From anywhere
  }

  # Allow frontend access (port 3000) from anywhere
  ingress {
    description = "Frontend"
    from_port   = 3000  # React app port
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # From anywhere
  }

  # Allow backend API access (port 8000) from anywhere
  ingress {
    description = "Backend"
    from_port   = 8000  # FastAPI port
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # From anywhere
  }

  # Allow all outbound connections (server can access internet)
  egress {
    from_port   = 0  # All ports
    to_port     = 0
    protocol    = "-1"  # All protocols
    cidr_blocks = ["0.0.0.0/0"]  # To anywhere
  }

  tags = {
    Name = "storygame-sg"  # Name displayed in AWS console
  }
}

# Create the actual EC2 server instance
resource "aws_instance" "storygame" {
  ami                    = data.aws_ami.al2023.id  # Use the AMI we found above
  instance_type          = var.instance_type  # Server size from variables
  key_name               = var.key_name  # SSH key for access
  vpc_security_group_ids = [aws_security_group.storygame_sg.id]  # Attach firewall

  user_data = file("${path.module}/user_data.sh")  # Run setup script on boot

  root_block_device {
    volume_size = 10  # 10 GB storage
    volume_type = "gp3"  # SSD storage type
  }

  tags = {
    Name = "StoryGame-Server"  # Name displayed in AWS console
  }
}
