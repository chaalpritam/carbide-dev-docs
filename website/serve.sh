#!/bin/bash

# Simple script to serve the documentation website locally

echo "🚀 Starting Carbide Network Documentation Server..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "📖 Documentation will be available at: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
# Check if Node.js is available
elif command -v node &> /dev/null; then
    echo "📖 Documentation will be available at: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx serve . -p 8000
# Check if PHP is available
elif command -v php &> /dev/null; then
    echo "📖 Documentation will be available at: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:8000
else
    echo "❌ Error: No suitable server found"
    echo "Please install one of the following:"
    echo "  - Python 3"
    echo "  - Node.js"
    echo "  - PHP"
    exit 1
fi
