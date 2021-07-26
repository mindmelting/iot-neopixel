
resource "aws_iam_user" "iot_homebridge" {
  name = "iot-homebridge"
}

resource "aws_iam_policy" "iot_homebridge" {
  name = "IoT_Homebridge"

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

resource "aws_iam_user_policy_attachment" "iot_homebridge" {
  user       = aws_iam_user.iot_homebridge.name
  policy_arn = aws_iam_policy.iot_homebridge.arn
}

resource "aws_iam_access_key" "iot_homebridge" {
  user    = aws_iam_user.iot_homebridge.name
}