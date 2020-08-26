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

resource "aws_iot_policy" "nexopixel_pub_sub" {
  name = "NeopixelPubSub"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iot:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iot_policy_attachment" "att" {
  policy = aws_iot_policy.nexopixel_pub_sub.name
  target = aws_iot_certificate.neopixel_cert.arn
}