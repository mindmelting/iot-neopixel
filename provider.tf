terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
    profile = "default"
    region = "ap-southeast-2"
}