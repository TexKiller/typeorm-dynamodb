/**
 * Entity manager supposed to work with any entity, automatically find its repository and call its methods,
 * whatever entity type are you passing.
 *
 * This implementation is used for DynamoDB driver which has some specifics in its EntityManager.
 */
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { ObjectId } from 'typeorm/driver/mongodb/typings';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { DynamoQueryRunner } from '../DynamoQueryRunner';
import { UpdateExpressionOptions } from '../models/UpdateExpressionOptions';
import { FindOptions } from '../models/FindOptions';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { ScanOptions } from '../models/ScanOptions';
import { BatchWriteItem } from '../models/BatchWriteItem';
import { DataSource } from 'typeorm/data-source';
import { PagingAndSortingRepository } from '../repository/PagingAndSortingRepository';
export declare class DynamoEntityManager extends EntityManager {
    get dynamodbQueryRunner(): DynamoQueryRunner;
    constructor(connection: DataSource);
    getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): PagingAndSortingRepository<Entity>;
    createDefaultKeyMapper<Entity>(target: EntityTarget<Entity>): (entity: ObjectLiteral) => any;
    update<Entity>(entityClassOrName: EntityTarget<Entity>, options: UpdateExpressionOptions): Promise<any>;
    /**
     * Finds entities that match given find options or conditions.
     */
    find<Entity>(entityClassOrName: EntityTarget<Entity>, options?: FindOptions | any): Promise<Entity[]>;
    /**
     * Finds entities that match given find options or conditions.
     */
    findAll<Entity>(entityClassOrName: EntityTarget<Entity>, options?: FindOptions): Promise<Entity[]>;
    scan<Entity>(entityClassOrName: EntityTarget<Entity>, options?: ScanOptions): Promise<any>;
    /**
     * Finds first entity that matches given conditions and/or find options.
     */
    findOne<Entity>(entityClass: EntityTarget<Entity>, options: FindOneOptions<Entity> | string): Promise<Entity | null>;
    /**
     * Finds first entity that matches given conditions and/or find options.
     */
    findOneBy<Entity>(entityClass: EntityTarget<Entity>, options: FindOptionsWhere<Entity>): Promise<Entity | null>;
    /**
     * Put a given entity into the database.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Executes fast and efficient INSERT query.
     * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
     * You can execute bulk inserts using this method.
     */
    put<Entity>(target: EntityTarget<Entity>, entity: ObjectLiteral | ObjectLiteral[]): Promise<any | any[]>;
    delete<Entity>(targetOrEntity: EntityTarget<Entity>, criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | any): Promise<DeleteResult>;
    deleteAll<Entity>(target: EntityTarget<Entity>, options: FindOptions, keyMapper?: any): Promise<void>;
    deleteAllBy<Entity>(target: EntityTarget<Entity>, options: FindOptions, keyMapper?: any): Promise<void>;
    deleteQueryBatch<Entity>(target: EntityTarget<Entity>, options: FindOptions, keyMapper?: any): Promise<void>;
    /**
     * Delete multiple documents on DynamoDB.
     */
    deleteMany<Entity>(entityClassOrName: EntityTarget<Entity>, keys: QueryDeepPartialEntity<Entity>[]): Promise<void>;
    /**
     * Delete a document on DynamoDB.
     */
    deleteOne<Entity>(entityClassOrName: EntityTarget<Entity>, key: ObjectLiteral): Promise<void>;
    /**
     * Put an array of documents into DynamoDB.
     */
    putMany<Entity>(entityClassOrName: EntityTarget<Entity>, docs: ObjectLiteral[]): Promise<void>;
    /**
     * Put a single document into DynamoDB.
     */
    putOne<Entity>(entityClassOrName: EntityTarget<Entity>, doc: ObjectLiteral): Promise<ObjectLiteral>;
    /**
     * Read from DynamoDB in batches.
     */
    batchRead<Entity>(entityClassOrName: EntityTarget<Entity>, keys: ObjectLiteral[]): Promise<any[]>;
    /**
     * Put an array of documents into DynamoDB in batches.
     */
    batchWrite<Entity>(entityClassOrName: EntityTarget<Entity>, writes: BatchWriteItem[]): Promise<void>;
    /**
     * Execute a statement on DynamoDB.
     */
    executeStatement(statement: string, params?: any[], nextToken?: string): Promise<import("@aws-sdk/lib-dynamodb").ExecuteStatementCommandOutput>;
}
