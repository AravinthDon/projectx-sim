#!/bin/bash

# Production Start Script for ProjectX-Sim
# This script builds and starts the server in production mode
# Can be run from any directory

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory
cd "$SCRIPT_DIR"

echo "🔨 Building ProjectX-Sim for production..."
echo "📂 Working directory: $SCRIPT_DIR"

# Clean previous build
if [ -d "dist" ]; then
    echo "📁 Cleaning previous build..."
    rm -rf dist
fi

# Build TypeScript to JavaScript
echo "🔧 Compiling TypeScript..."
npm run build

echo "✅ Build complete!"
echo ""
echo "🚀 Starting server in production mode..."
echo "   Mode: relaxed"
echo "   Host: localhost"
echo "   Port: 8080"
echo ""

# Start server with environment variables
HOST=localhost AUTH_MODE=relaxed node dist/index.js
