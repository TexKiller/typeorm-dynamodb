import { UpdateExpressionOptions } from '../models/UpdateExpressionOptions';
import { FindOptions } from '../models/FindOptions';
import { IndexMetadata } from 'typeorm/metadata/IndexMetadata';
export declare const paramHelper: {
    find(tableName: string, options: FindOptions, indices?: IndexMetadata[]): any;
    update(tableName: string, options: UpdateExpressionOptions): {
        TableName: string;
        Key: any;
        UpdateExpression: string;
        ExpressionAttributeNames: any;
        ExpressionAttributeValues: any;
    };
};
