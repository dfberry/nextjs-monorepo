#!/bin/bash

# openssl rand -hex 32  # For the 32-byte encryption key
# openssl rand -hex 16  # For the 16-byte IV

# Generate a 32-byte encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Generate a 16-byte IV
ENCRYPTION_IV=$(openssl rand -hex 16)

# Define the path to the .env file in the parent directory
ENV_FILE=".env"

# Write the keys to the .env file
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" > $ENV_FILE
echo "ENCRYPTION_IV=$ENCRYPTION_IV" >> $ENV_FILE

echo "Encryption key and IV have been generated and saved to $ENV_FILE"