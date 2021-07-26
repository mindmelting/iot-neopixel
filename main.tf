resource "aws_iot_thing" "iot" {
  count = length(var.things)
  name = var.things[count.index]
}

resource "aws_iot_certificate" "iot_cert" {
  count = length(var.things)
  active = true
}

resource "aws_iot_thing_principal_attachment" "att" {
  count = length(var.things)
  principal = aws_iot_certificate.iot_cert[count.index].arn
  thing     = aws_iot_thing.iot[count.index].name
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
  count = length(var.things)
  policy = aws_iot_policy.iot_pub_sub.name
  target = aws_iot_certificate.iot_cert[count.index].arn
}