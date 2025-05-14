#!/bin/bash

# Build and Deploy Script for Text Processor App

echo "🚀 Starting build and deployment process for Text Processor App..."

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing project dependencies..."
  npm install
fi

# Step 3: Build the project
echo "🔨 Building the project..."
npm run build

# Step 4: Deploy to AWS
echo "☁️ Deploying to AWS..."
npm run deploy

# Step 5: Get the API endpoint URL
echo "🔍 Getting API endpoint URL..."
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name TextProcessorStack --query "Stacks[0].Outputs[?ExportName=='TextProcessorApiEndpoint'].OutputValue" --output text)

if [ -z "$API_ENDPOINT" ]; then
  echo "❌ Error: Could not find the API endpoint. Deployment may have failed."
  exit 1
fi

echo "✅ Deployment complete!"
echo "📝 API Endpoint: $API_ENDPOINT"
echo ""
echo "To test the API, run:"
echo "./test.sh"
echo ""
echo "To clean up resources when done:"
echo "npm run destroy"