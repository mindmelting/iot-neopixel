resource "aws_iot_thing" "iot_thing" {
  count = length(var.things)
  name = var.things[count.index]
}

resource "aws_iot_certificate" "iot_certificate" {
  count = length(var.things)
  active = true
}

resource "aws_iot_thing_principal_attachment" "iot_thing_attachment" {
  count = length(var.things)
  principal = aws_iot_certificate.iot_certificate[count.index].arn
  thing     = aws_iot_thing.iot_thing[count.index].name
}

resource "aws_iot_policy" "iot_policy" {
  name = "iot-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "iot:*",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_policy" "iot_shadow_iam_policy" {
  name = "iot-shadow-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "iot:GetThingShadow",
          "iot:UpdateThingShadow"
        ]
        Effect    = "Allow"
        Resource  = aws_iot_thing.iot_thing.*.arn
      },
    ]
  })
}

resource "aws_iot_policy_attachment" "iot_policy_attachment" {
  count = length(var.things)
  policy = aws_iot_policy.iot_policy.name
  target = aws_iot_certificate.iot_certificate[count.index].arn
}

resource "aws_iot_topic_rule" "delta_iot_topic_rule" {
  name        = "iot_delta_rule"
  description = "Shadow Delta rule"
  enabled     = true
  sql         = "SELECT state, topic(3) as thing_id FROM '$aws/things/+/shadow/update/delta'"
  sql_version = "2016-03-23"

  lambda {
    function_arn = aws_lambda_function.iot_gh_state.arn
  }
}