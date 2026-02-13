# This file displays useful information after Terraform creates resources
# Run "terraform output" to see these values anytime

# Shows the unique ID of your EC2 instance
output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.storygame.id
}

# Shows the public IP address to access your server
output "instance_public_ip" {
  description = "Public IP address"
  value       = aws_instance.storygame.public_ip
}

# Shows complete URL to access the frontend app
output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_instance.storygame.public_ip}:3000"
}

# Shows complete URL to access the backend API
output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.storygame.public_ip}:8000"
}

# Shows ready-to-use SSH command to connect to server
output "ssh_command" {
  description = "SSH command"
  value       = "ssh -i ${var.key_name}.pem ec2-user@${aws_instance.storygame.public_ip}"
}
