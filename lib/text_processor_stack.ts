import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TextProcessorConstruct } from './constructs/text_processor';

export class TextProcessorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the text processor pipeline construct
    const textProcessor = new TextProcessorConstruct(this, 'TextProcessor');
  }
}