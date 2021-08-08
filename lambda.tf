resource "aws_lambda_function" "iot_gh_event" {
  function_name    = "iot-google-home-event"
  filename         = "./lambda/build/lambda.zip"
  source_code_hash = filebase64sha256("./lambda/build/lambda.zip")
  handler          = "main.ghevent"
  runtime          = "nodejs14.x"
  layers           = [aws_lambda_layer_version.node_layer.arn]

  role = aws_iam_role.lambda_iam_role.arn

  environment {
    variables = {
      "IOT_ENDPOINT" = data.aws_iot_endpoint.iot.endpoint_address
      "IOT_THINGS"   = join(",", aws_iot_thing.iot_thing.*.name)
    }
  }
}

resource "aws_lambda_function" "iot_gh_state" {
  function_name    = "iot-google-report-state"
  filename         = "./lambda/build/lambda.zip"
  source_code_hash = filebase64sha256("./lambda/build/lambda.zip")
  handler          = "main.ghstate"
  runtime          = "nodejs14.x"
  layers           = [aws_lambda_layer_version.node_layer.arn]

  role = aws_iam_role.lambda_iam_role.arn

  environment {
    variables = {
      "IOT_ENDPOINT"                = data.aws_iot_endpoint.iot.endpoint_address
      "IOT_THINGS"                  = join(",", aws_iot_thing.iot_thing.*.name)
      "GOOGLE_SERVICE_ACCOUNT_JSON" = var.google_service_account_json
    }
  }
}

resource "aws_lambda_layer_version" "node_layer" {
  layer_name          = "iot-node-layer"
  filename            = "./lambda/build/layer.zip"
  source_code_hash    = filebase64sha256("./lambda/build/layer.zip")
  compatible_runtimes = ["nodejs14.x"]

}

resource "aws_iam_role" "lambda_iam_role" {
  name = "iot-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action : "sts:AssumeRole",
        Principal : {
          Service : "lambda.amazonaws.com"
        },
        Effect : "Allow",
        Sid : ""
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "iot_attachment" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = aws_iam_policy.iot_shadow_iam_policy.arn
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attachment" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_permission" "apigw_gh_event" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.iot_gh_event.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.iot.execution_arn}/*/*"
}

resource "aws_lambda_permission" "iot_core_gh_state" {
  statement_id  = "AllowIoTGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.iot_gh_state.function_name
  principal     = "iot.amazonaws.com"
  source_arn    = aws_iot_topic_rule.delta_iot_topic_rule.arn
}
