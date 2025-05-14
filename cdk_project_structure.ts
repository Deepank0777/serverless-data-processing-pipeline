// Project structure for the AWS CDK application
/*
text-processor-app/
├── bin/
│   └── text_processor_app.ts      // CDK entry point
├── lib/
│   ├── text_processor_stack.ts    // Main stack definition
│   └── constructs/
│       └── text_processor.ts      // Custom construct for the pipeline
├── lambda/
│   └── text-processor/
│       ├── index.ts               // Lambda handler
│       └── package.json           // Lambda dependencies
├── cdk.json                       // CDK configuration
├── package.json                   // Project dependencies
├── tsconfig.json                  // TypeScript configuration
└── README.md                      // Documentation
*/