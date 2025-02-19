import { FindOptions } from '../models/FindOptions';
import { ScanOptions } from '../models/ScanOptions';
import { BatchWriteItem } from '../models/BatchWriteItem';
import { ObjectId } from 'typeorm/driver/mongodb/typings';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { Repository } from 'typeorm/repository/Repository';
import { DynamoReadStream } from '../DynamoReadStream';
import { DynamoEntityManager } from '../entity-manager/DynamoEntityManager';
import { DynamoQueryRunner } from '../DynamoQueryRunner';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AddOptions } from '../models/AddOptions';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { UpdateExpressionOptions } from '../models/UpdateExpressionOptions';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
export declare class DynamoRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    /**
     * Entity Manager used by this repository.
     */
    readonly manager: DynamoEntityManager;
    /**
     * Entity metadata of the entity current repository manages.
     */
    get metadata(): import("typeorm").EntityMetadata;
    /**
     * Query runner provider used for this repository.
     */
    readonly queryRunner?: DynamoQueryRunner;
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    createQueryBuilder(alias?: string, queryRunner?: DynamoQueryRunner): SelectQueryBuilder<Entity>;
    get(key: any): Promise<Entity | null>;
    find(options?: FindOptions | any): Promise<Entity[]>;
    findAll(options?: FindOptions): Promise<Entity[]>;
    /**
     * Finds first entity by a given find options.
     * If entity was not found in the database - returns null.
     */
    findOne(options: FindOneOptions<Entity> | string): Promise<Entity | null>;
    /**
     * Finds first entity by a given find options.
     * If entity was not found in the database - returns null.
     */
    findOneBy(where: FindOptionsWhere<Entity>): Promise<Entity | null>;
    add(options: AddOptions): Promise<any>;
    scan(options?: ScanOptions): Promise<any>;
    /**
     * Saves one or many given entities.
     */
    save<T extends DeepPartial<Entity>>(entityOrEntities: T | T[], options?: SaveOptions): Promise<T | T[]>;
    put(content: DeepPartial<Entity> | DeepPartial<Entity>[]): Promise<any>;
    putMany(content: DeepPartial<Entity>[]): Promise<void>;
    putOne(content: DeepPartial<Entity | Entity[]>): Promise<ObjectLiteral>;
    delete(criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<Entity>): Promise<DeleteResult>;
    deleteOne(key: QueryDeepPartialEntity<Entity>): Promise<void>;
    deleteMany(keys: QueryDeepPartialEntity<Entity>[]): Promise<void>;
    deleteAll(keyMapper?: any): Promise<void>;
    deleteAllBy(options: FindOptions, keyMapper?: any): Promise<void>;
    deleteQueryBatch(options: FindOptions, keyMapper?: any): Promise<void>;
    batchRead(keys: any[]): Promise<any[]>;
    batchWrite(writes: BatchWriteItem[]): Promise<void>;
    executeStatement(statement: string, params?: any[]): Promise<Entity[] | undefined>;
    /**
     * @deprecated use put(...) or updateExpression(...) for dynamodb.
     */
    update(criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<Entity>, partialEntity: QueryDeepPartialEntity<Entity>): Promise<UpdateResult>;
    updateExpression(options: UpdateExpressionOptions): Promise<UpdateResult>;
    streamAll(): Promise<DynamoReadStream<Entity>>;
}
