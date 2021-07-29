output "iot_pem" {
  value       = aws_iot_certificate.iot_certificate.*.certificate_pem
  description = "IoT certificate data, in PEM format"
  sensitive   = true
}

output "iot_public_key" {
  value       = aws_iot_certificate.iot_certificate.*.public_key
  description = "IoT public key"
  sensitive   = true
}

output "iot_private_key" {
  value       = aws_iot_certificate.iot_certificate.*.private_key
  description = "IoT private key"
  sensitive   = true
}

output "base_url" {
  value = aws_api_gateway_deployment.iot.invoke_url
}

output "iot_homebridge_access_id" {
  value = aws_iam_access_key.homebridge_iam_access_key.id
}

output "iot_homebridge_access_secret" {
  value     = aws_iam_access_key.homebridge_iam_access_key.secret
  sensitive = true
}