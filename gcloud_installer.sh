#!/bin/bash

#install updates
echo "Installing updates"
sudo apt-get update -y
sudo apt-get install apt-transport-https ca-certificates gnupg curl sudo -y

#install gcloud
echo "Installing gcloud"
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg

echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

sudo apt-get update && sudo apt-get install google-cloud-cli
echo "gcloud installed"

echo "Set up Application Default Credentials"
gcloud auth application-default login

echo "gcloud setup complete"