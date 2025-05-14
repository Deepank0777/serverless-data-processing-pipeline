# Text Processor - Serverless Data Processing Pipeline

This project implements a serverless data processing pipeline using AWS services. It accepts text file uploads via an API, processes the data, and stores it in a DynamoDB database.

## Architecture

The solution consists of:

- **API Gateway**: Receives HTTP POST requests with text files
- **Lambda Function**: Processes the uploaded text data
- **DynamoDB**: Stores the processed data
- **CloudWatch**: Monitors the pipeline and logs
- **IAM**: Manages security permissions

The entire infrastructure is defined as code using AWS CDK in TypeScript.

## Prerequisites

- AWS CLI installed and configured with appropriate permissions
- Node.js (v14.x or later)
- npm or yarn
- AWS account with permissions to create the required resources

## Setup Instructions

### 1. Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd serverless-data-processing-pipeline

# Install project dependencies
npm install
```

### 2. Build the Project

```bash
# Build the CDK project and Lambda function
npm run build

# Or to build just the Lambda function
cd lambda/text-processor && npm run build
```

### 2. Bootstrap AWS CDK (if not already done)

```bash
npm run bootstrap
```

This command prepares your AWS environment for CDK deployments.

### 3. Deploy the Stack

```bash
npm run deploy
```

This command deploys the entire infrastructure to your AWS account. After successful deployment, the command will output the API endpoint URL that you'll use for testing.

### 4. Testing the API

You can test the API using `curl` or any HTTP client:

```bash
# Using curl to send a text file
curl -X POST \
  https://<api-id>.execute-api.<region>.amazonaws.com/prod/processText \
  -H "Content-Type: text/plain" \
  -d "This is a sample text file that will be processed by our serverless pipeline. It demonstrates the capability of our text processing service."

# Alternatively, you can send a JSON payload
curl -X POST \
  https://<api-id>.execute-api.<region>.amazonaws.com/prod/processText \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a sample text content sent as JSON that will be processed by our serverless pipeline."}'
```

### 5. View Data in DynamoDB

You can view the processed data in the DynamoDB table via the AWS Console:

1. Open the AWS Console
2. Navigate to DynamoDB
3. Select the "TextProcessorStack-TextProcessorProcessedTextTable-\*" table
4. Browse the items to see your processed data

### 6. Monitoring and Logs

To view logs and monitor the pipeline:

1. Open the AWS Console
2. Navigate to CloudWatch
3. Under "Logs" > "Log groups", select the "/aws/lambda/TextProcessorStack-TextProcessorTextProcessorFunction-\*" log group
4. Browse the log streams to see the Lambda function execution logs

## Clean Up

To avoid incurring charges, delete the resources when you're done:

```bash
npm run destroy
```

## Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  API        │     │  Lambda      │     │  DynamoDB   │
│  Gateway    │────▶│  Function    │────▶│  Table      │
│  Endpoint   │     │  Processing  │     │  Storage    │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                   │
       │                   │
       │                   ▼
┌─────────────┐     ┌──────────────┐
│  HTTP       │     │  CloudWatch  │
│  Client     │     │  Monitoring  │
│  (curl)     │     │  & Logs      │
└─────────────┘     └──────────────┘
```

## Customization

To customize the text processing logic, modify the `processText` function in `lambda/text-processor/index.ts`. Rebuild and redeploy the stack after making changes:

```bash
npm run build
npm run deploy
```

## Security Considerations

- The API Gateway is configured with CORS enabled for demonstration purposes. For production use, restrict CORS to specific origins.
- Consider adding API keys and usage plans for production deployments.
- The Lambda function has the minimal required permissions to interact with DynamoDB.
- Consider encrypting the DynamoDB table for sensitive data.
