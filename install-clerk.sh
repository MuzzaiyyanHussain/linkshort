#!/bin/bash
# Installation script for Clerk setup

echo "🚀 Installing Clerk dependencies..."
cd "c:\Users\hussa\desktop\bit.ly"

# Clean install
echo "Cleaning node_modules..."
rm -rf node_modules package-lock.json

# Install all dependencies
echo "Installing npm packages..."
npm install

echo "✅ Installation complete! You can now run 'npm run dev'"
