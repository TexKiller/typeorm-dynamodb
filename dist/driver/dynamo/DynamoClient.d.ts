import { PutItemInput, UpdateItemInput, ScanInput, QueryInput, BatchWriteItemInput, DeleteTableInput, DeleteItemInput, BatchGetItemInput, DescribeTableInput, CreateTableInput, UpdateTableInput, ListTablesInput, DynamoDBClientConfigType } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
export declare class DynamoClient {
    getClient(config?: DynamoDBClientConfigType): DynamoDBDocumentClient;
    put(params: PutItemInput): Promise<import("@aws-sdk/lib-dynamodb").PutCommandOutput>;
    update(params: UpdateItemInput): Promise<any>;
    scan(params: ScanInput): Promise<import("@aws-sdk/client-dynamodb").ScanCommandOutput>;
    query(params: QueryInput): Promise<import("@aws-sdk/client-dynamodb").QueryCommandOutput>;
    delete(params: DeleteItemInput): Promise<import("@aws-sdk/lib-dynamodb").DeleteCommandOutput>;
    batchGet(params: BatchGetItemInput): Promise<import("@aws-sdk/lib-dynamodb").BatchGetCommandOutput>;
    batchWrite(params: BatchWriteItemInput): Promise<import("@aws-sdk/lib-dynamodb").BatchWriteCommandOutput>;
    executeStatement(params: ExecuteStatementCommandInput): Promise<import("@aws-sdk/lib-dynamodb").ExecuteStatementCommandOutput>;
    deleteTable(params: DeleteTableInput): Promise<import("@aws-sdk/client-dynamodb").DeleteTableCommandOutput>;
    describeTable(params: DescribeTableInput): Promise<import("@aws-sdk/client-dynamodb").DescribeTableCommandOutput>;
    listTables(params: ListTablesInput): Promise<import("@aws-sdk/client-dynamodb").ListTablesCommandOutput>;
    createTable(params: CreateTableInput): Promise<import("@aws-sdk/client-dynamodb").CreateTableCommandOutput>;
    updateTable(params: UpdateTableInput): Promise<import("@aws-sdk/client-dynamodb").UpdateTableCommandOutput>;
}
export declare const getDocumentClient: () => DynamoClient;
