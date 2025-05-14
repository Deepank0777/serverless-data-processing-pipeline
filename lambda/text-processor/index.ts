import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME!;

/**
 * Lambda handler for processing text files
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Event received:', JSON.stringify(event, null, 2));

    try {
        // Validate the request
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Request body is missing' }),
            };
        }

        // Check if the content is base64 encoded (binary file upload)
        let textContent: string;
        if (event.isBase64Encoded) {
            const buffer = Buffer.from(event.body, 'base64');
            textContent = buffer.toString('utf-8');
        } else {
            // Try to parse as JSON first
            try {
                const jsonBody = JSON.parse(event.body);
                textContent = jsonBody.content || event.body;
            } catch (e) {
                // If not JSON, use the raw body as text
                textContent = event.body;
            }
        }

        // Process the text content
        // In a real application, this would include more sophisticated processing
        const processedData = processText(textContent);

        // Generate a unique ID for the record
        const id = uuidv4();

        // Store the processed data in DynamoDB
        await dynamoDB.put({
            TableName: tableName,
            Item: {
                id,
                timestamp: new Date().toISOString(),
                originalSize: textContent.length,
                processedSize: processedData.processedText.length,
                wordCount: processedData.wordCount,
                ...processedData
            }
        }).promise();

        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Text processed successfully',
                id,
                stats: {
                    originalSize: textContent.length,
                    processedSize: processedData.processedText.length,
                    wordCount: processedData.wordCount
                }
            }),
        };
    } catch (error) {
        // Log the error for troubleshooting
        console.error('Error processing text:', error);

        // Return error response
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Error processing text',
                message: (error as Error).message
            }),
        };
    }
};

/**
 * Process text content
 * This is a simple example - expand as needed for your use case
 */
function processText(text: string): {
    processedText: string;
    wordCount: number;
    charCount: number;
    lineCount: number;
} {
    // Simple processing: trim whitespace, normalize line breaks
    const processedText = text.trim().replace(/\r\n/g, '\n');

    // Calculate some basic statistics
    const wordCount = processedText.split(/\s+/).filter(Boolean).length;
    const charCount = processedText.length;
    const lineCount = processedText.split('\n').length;

    return {
        processedText,
        wordCount,
        charCount,
        lineCount
    };
}