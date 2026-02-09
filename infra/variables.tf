variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 instance type (free tier: t2.micro or t3.micro)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of your AWS key pair"
  type        = string
  default     = "storygame-key"
}
