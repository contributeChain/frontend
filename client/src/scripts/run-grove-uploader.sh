#!/bin/bash

# Set the current directory to the project root
cd "$(dirname "$0")/../../.."

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
  echo "Error: PRIVATE_KEY environment variable is not set."
  echo "Please set it with: export PRIVATE_KEY=your_private_key_here"
  exit 1
fi

echo "Starting Grove uploader..."
echo "This will upload mock data to Grove storage and save the URIs to config/grove-uris.json"

# Run the uploader script with ES module support
cd client
npx ts-node --esm --experimental-specifier-resolution=node src/scripts/grove-uploader.ts

# Check if the script executed successfully
if [ $? -eq 0 ]; then
  echo "Grove upload completed successfully!"
  echo "URIs saved to src/config/grove-uris.json"
  echo "You can now run the application with: npm run dev"
else
  echo "Error: Grove upload failed."
  echo "Please check the error messages above and try again."
fi 