variable "things" {
  type = list(string)
  description = "List of devices to create in AWS IoT"
  default = ["arduino_neopixel"]
}