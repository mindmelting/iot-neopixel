output "neopixel_pem" {
  value       = aws_iot_certificate.neopixel_cert.certificate_pem
  description = "Neopixel certificate data, in PEM format"
}

output "neopixel_public_key" {
  value       = aws_iot_certificate.neopixel_cert.public_key
  description = "Neopixel public key"
}

output "neopixel_private_key" {
  value       = aws_iot_certificate.neopixel_cert.private_key
  description = "Neopixel private key"
}