import { FindOptions } from '../models/FindOptions';
import { Pageable } from '../models/Pageable';
import { PageExpensive } from '../models/PageExpensive';
import { Page } from '../models/Page';
import { DynamoRepository } from './DynamoRepository';
import { ObjectLiteral } from 'typeorm';
export declare class PagingAndSortingRepository<T extends ObjectLiteral> extends DynamoRepository<T> {
    /**
     * Queries by page size and exclusiveStartKey
     */
    findPage(options: FindOptions, pageable: Pageable): Promise<Page<unknown>>;
    /**
     * Queries ALL items then returns the desired subset
     * WARNING: This is NOT an efficient way of querying dynamodb.
     * Please only use this if you must, preferably on lightly used pages
     */
    findPageWithCountExpensive(options: FindOptions, pageable: Pageable): Promise<PageExpensive<T>>;
}
