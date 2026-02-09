output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.storygame.id
}

output "instance_public_ip" {
  description = "Public IP address"
  value       = aws_instance.storygame.public_ip
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_instance.storygame.public_ip}:3000"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.storygame.public_ip}:8000"
}

output "ssh_command" {
  description = "SSH command"
  value       = "ssh -i ${var.key_name}.pem ec2-user@${aws_instance.storygame.public_ip}"
}
