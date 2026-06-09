#!/bin/bash

# Ensure the script runs in the directory where it is located
cd "$(dirname "$0")"

echo "========================================================"
echo "Error404 Admin - Automatic Setup Script"
echo "========================================================"

echo ""
echo "Installing dependencies for Admin Server..."
cd server || exit
npm install
echo "Creating .env for Admin Server..."
cat << 'EOF' > .env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/error404
NODE_ENV=development
EOF
cd ..

echo ""
echo "Installing dependencies for Admin Client..."
cd client || exit
npm install
echo "Creating .env for Admin Client..."
cat << 'EOF' > .env
VITE_API_URL=http://localhost:8000
EOF
cd ..

echo ""
echo "========================================================"
echo "Setup Complete!"
echo "Please update the generated .env files with your actual credentials."
echo "========================================================"
echo "Press [Enter] to exit..."
read -r
