output "iot_pem" {
  value       = aws_iot_certificate.iot_cert.certificate_pem
  description = "IoT certificate data, in PEM format"
}

output "iot_public_key" {
  value       = aws_iot_certificate.iot_cert.public_key
  description = "IoT public key"
}

output "iot_private_key" {
  value       = aws_iot_certificate.iot_cert.private_key
  description = "IoT private key"
}

output "base_url" {
  value = aws_api_gateway_deployment.iot.invoke_url
}