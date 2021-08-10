
resource "aws_iam_user" "homebridge_iam_user" {
  name = "iot-homebridge-user"
}

resource "aws_iam_policy" "iot_homebridge_iam_policy" {
  name = "iot-homebridge-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "iot:ListThings",
        ]
        Effect   = "Allow"
      },
    ]
  })
}

resource "aws_iam_user_policy_attachment" "homebridge_attachment" {
  user       = aws_iam_user.homebridge_iam_user.name
  policy_arn = aws_iam_policy.iot_shadow_iam_policy.arn
}

resource "aws_iam_user_policy_attachment" "homebridge_attachment" {
  user       = aws_iam_user.homebridge_iam_user.name
  policy_arn = aws_iam_policy.iot_homebridge_iam_policy.arn
}

resource "aws_iam_access_key" "homebridge_iam_access_key" {
  user = aws_iam_user.homebridge_iam_user.name
}