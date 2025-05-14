#!/bin/bash

# Text Processor App - Test Script
# This script tests the deployed API endpoint

# Replace with your actual API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name TextProcessorStack --query "Stacks[0].Outputs[?ExportName=='TextProcessorApiEndpoint'].OutputValue" --output text)

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: Could not find the API endpoint. Make sure the stack is deployed."
  exit 1
fi

echo "Testing the Text Processor API endpoint: $API_ENDPOINT"
echo 

# Test 1: Send a text file with direct content
echo "Test 1: Sending text content directly..."
curl -X POST \
  "${API_ENDPOINT}processText" \
  -H "Content-Type: text/plain" \
  -d "This is a sample text file that will be processed by our serverless pipeline. It demonstrates the capability of our text processing service."

echo
echo

# Test 2: Send JSON payload
echo "Test 2: Sending JSON payload..."
curl -X POST \
  "${API_ENDPOINT}processText" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a sample text content sent as JSON that will be processed by our serverless pipeline."}'

echo
echo

# Test 3: Send a text file from a local file
echo "Test 3: Sending a text file from local file..."
echo "This is a text file content that will be uploaded and processed by our serverless pipeline." > sample.txt
curl -X POST \
  "${API_ENDPOINT}processText" \
  -H "Content-Type: text/plain" \
  --data-binary "@sample.txt"

echo
echo

# Check DynamoDB records
TABLE_NAME=$(aws cloudformation describe-stacks --stack-name TextProcessorStack --query "Stacks[0].Outputs[?ExportName=='TextProcessorTableName'].OutputValue" --output text)

if [ -z "$TABLE_NAME" ]; then
  echo "Error: Could not find the DynamoDB table. Make sure the stack is deployed."
  exit 1
fi

echo "DynamoDB Table: $TABLE_NAME"
echo "Latest items in the DynamoDB table:"

aws dynamodb scan \
  --table-name "$TABLE_NAME" \
  --limit 5 \
  --query "Items[*].{ID:id,Timestamp:timestamp,WordCount:wordCount,CharCount:charCount}" \
  --output table

echo
echo "Clean up temp file..."
rm -f sample.txt

echo "Done!"