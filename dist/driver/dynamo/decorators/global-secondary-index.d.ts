export interface GlobalSecondaryIndexOptions {
    name: string;
    partitionKey: string | string[];
    sortKey?: string | string[];
}
/**
 * Creates a database index.
 * Can be used on entity.
 * Can create indices with composite columns when used on entity.
 */
export declare function GlobalSecondaryIndex(options: GlobalSecondaryIndexOptions): ClassDecorator;
