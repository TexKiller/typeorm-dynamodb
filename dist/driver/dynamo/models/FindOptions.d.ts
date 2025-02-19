import { FindOperator } from 'typeorm';
export declare const BeginsWith: (value: string) => FindOperator<string>;
export declare class FindOptions {
    index?: string;
    where?: any;
    limit?: number;
    sort?: string;
    exclusiveStartKey?: string;
    filter?: string;
    select?: string;
    static toAttributeNames(findOptions: FindOptions): any;
    static toKeyConditionExpression(findOptions: FindOptions): string | undefined;
    static toExpressionAttributeValues(findOptions: FindOptions): any;
    static toFilterExpression(options: FindOptions): string | undefined;
    static toProjectionExpression(options: FindOptions): string | undefined;
}
