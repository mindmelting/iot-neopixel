variable "things" {
  type        = list(string)
  description = "List of devices to create in AWS IoT"
  default     = ["neopixel"]
}

variable "google_project_id" {
  type = string
}

variable "google_private_key_id" {
  type = string
}

variable "google_private_key" {
  type      = string
  sensitive = true
}

variable "google_client_email" {
  type = string
}

variable "google_client_id" {
  type = string
}

variable "google_x509_cert_url" {
  type = string
}