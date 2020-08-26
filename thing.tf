resource "aws_iot_thing" "neopixel" {
  name = "neopixel"
}

resource "aws_iot_certificate" "neopixel_cert" {
  active = true
}

resource "aws_iot_thing_principal_attachment" "att" {
  principal = aws_iot_certificate.neopixel_cert.arn
  thing     = aws_iot_thing.neopixel.name
}