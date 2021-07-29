terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
  backend "remote" {
    organization = "mindmelting"

    workspaces {
      name = "iot-neopixel"
    }
  }
}

provider "aws" {
  profile = "default"
  region  = "ap-southeast-2"
}