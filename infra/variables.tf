# This file defines input variables for Terraform
# These values can be changed in terraform.tfvars

# Which AWS region to create resources in (Stockholm = eu-north-1)
variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "eu-north-1"
}

# Size of EC2 server (t3.micro = free tier eligible)
variable "instance_type" {
  description = "EC2 instance type (free tier: t2.micro or t3.micro)"
  type        = string
  default     = "t3.micro"
}

# Name of SSH key in AWS to access the server
variable "key_name" {
  description = "Name of your AWS key pair"
  type        = string
  default     = "storygame-key"
}
