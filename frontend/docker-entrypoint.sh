#!/bin/sh
set -e

# This script injects environment variables into the built JavaScript files at runtime
# This allows the same Docker image to be used across different environments

echo "Injecting runtime environment variables..."

# Define the directory containing the built files
BUILD_DIR="/usr/share/nginx/html/assets"

# Find all JS files and inject environment variables
if [ -d "$BUILD_DIR" ]; then
    find "$BUILD_DIR" -type f -name "*.js" -exec sed -i \
        -e "s|VITE_BACKEND_SERVER_PLACEHOLDER|${VITE_BACKEND_SERVER:-https://your-backend.run.app/}|g" \
        -e "s|VITE_FILE_BASE_URL_PLACEHOLDER|${VITE_FILE_BASE_URL:-https://your-backend.run.app/}|g" \
        {} \;
    echo "Environment variables injected successfully"
else
    echo "Build directory not found, skipping environment variable injection"
fi

# Execute the main command (nginx)
exec "$@"
