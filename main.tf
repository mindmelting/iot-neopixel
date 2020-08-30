resource "aws_iot_thing" "iot" {
  name = var.thing_name
}

resource "aws_iot_certificate" "iot_cert" {
  active = true
}

resource "aws_iot_thing_principal_attachment" "att" {
  principal = aws_iot_certificate.iot_cert.arn
  thing     = aws_iot_thing.iot.name
}

resource "aws_iot_policy" "iot_pub_sub" {
  name = "IoTPubSub"

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
  policy = aws_iot_policy.iot_pub_sub.name
  target = aws_iot_certificate.iot_cert.arn
}