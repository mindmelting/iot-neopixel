variable "things" {
  type        = list(string)
  description = "List of devices to create in AWS IoT"
  default     = ["neopixel"]
}

variable "google_service_account_json" {
  type      = string
  sensitive = true
}