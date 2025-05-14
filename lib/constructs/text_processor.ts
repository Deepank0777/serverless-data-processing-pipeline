import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class TextProcessorConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create DynamoDB table to store processed text data
    this.table = new dynamodb.Table(this, 'ProcessedTextTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity for cost optimization
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For easy cleanup in POC environment
    });

    // Create Lambda function for text processing
    const textProcessorLambda = new lambda.Function(this, 'TextProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/text-processor/dist')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: this.table.tableName,
      },
      // Enable X-Ray tracing for better observability
      tracing: lambda.Tracing.ACTIVE,
    });

    // Grant Lambda function permission to write to DynamoDB
    this.table.grantWriteData(textProcessorLambda);

    // Create API Gateway REST API
    this.api = new apigateway.RestApi(this, 'TextProcessorApi', {
      restApiName: 'Text Processor Service',
      description: 'API for uploading and processing text files',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true, // For POC debugging purposes
      },
      // Set default CORS policy
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Create API Gateway resource and method for file upload
    const textResource = this.api.root.addResource('processText');
    textResource.addMethod('POST', new apigateway.LambdaIntegration(textProcessorLambda), {
      apiKeyRequired: false, // Consider enabling for production with a usage plan
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: '400',
          responseModels: {
            'application/json': apigateway.Model.ERROR_MODEL,
          },
        },
        {
          statusCode: '500',
          responseModels: {
            'application/json': apigateway.Model.ERROR_MODEL,
          },
        },
      ],
    });

    // Add resource policy to API Gateway
    const apiResourcePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          principals: [new iam.AnyPrincipal()],
          actions: ['execute-api:Invoke'],
          resources: ['execute-api:/*'],
        }),
      ],
    });

    // Apply resource policy to API Gateway
    (this.api.node.defaultChild as apigateway.CfnRestApi).addPropertyOverride(
      'Policy', apiResourcePolicy.toJSON()
    );

    // Output the API endpoint URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'URL of the API endpoint',
      exportName: 'TextProcessorApiEndpoint',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'Name of the DynamoDB table',
      exportName: 'TextProcessorTableName',
    });
  }
}