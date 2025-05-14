#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TextProcessorStack } from '../lib/text_processor_stack';

const app = new cdk.App();
new TextProcessorStack(app, 'TextProcessorStack', {
    // Set environment if specific account/region is needed
    // env: { account: '123456789012', region: 'us-east-1' },

    // Add description to the stack
    description: 'A serverless text processing pipeline with API Gateway, Lambda, and DynamoDB',
});