"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoEntityManager = void 0;
/**
 * Entity manager supposed to work with any entity, automatically find its repository and call its methods,
 * whatever entity type are you passing.
 *
 * This implementation is used for DynamoDB driver which has some specifics in its EntityManager.
 */
const EntityManager_1 = require("typeorm/entity-manager/EntityManager");
const FindOptionsUtils_1 = require("typeorm/find-options/FindOptionsUtils");
const param_helper_1 = require("../helpers/param-helper");
const DynamoGlobalSecondaryIndexHelper_1 = require("../helpers/DynamoGlobalSecondaryIndexHelper");
const FindOptions_1 = require("../models/FindOptions");
const DynamoBatchHelper_1 = require("../helpers/DynamoBatchHelper");
const DynamoObjectHelper_1 = require("../helpers/DynamoObjectHelper");
const DynamoClient_1 = require("../DynamoClient");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const PagingAndSortingRepository_1 = require("../repository/PagingAndSortingRepository");
// todo: we should look at the @PrimaryKey on the entity
const DEFAULT_KEY_MAPPER = (item) => {
    return {
        id: item.id
    };
};
const unmarshallAll = (items) => {
    return (items || []).map(item => (0, util_dynamodb_1.unmarshall)(item));
};
class DynamoEntityManager extends EntityManager_1.EntityManager {
    get dynamodbQueryRunner() {
        return this.connection.driver
            .queryRunner;
    }
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(connection) {
        super(connection);
    }
    getRepository(target) {
        return new PagingAndSortingRepository_1.PagingAndSortingRepository(target, this, this.queryRunner);
    }
    // -------------------------------------------------------------------------
    // Overridden Methods
    // -------------------------------------------------------------------------
    createDefaultKeyMapper(target) {
        const metadata = this.connection.getMetadata(target);
        return (entity) => {
            const keys = {};
            for (let i = 0; i < metadata.primaryColumns.length; i++) {
                const primaryColumn = metadata.primaryColumns[i];
                const propertyName = primaryColumn.propertyName;
                keys[propertyName] = entity[propertyName];
            }
            return keys;
        };
    }
    update(entityClassOrName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = this.connection.getMetadata(entityClassOrName);
            const changedValues = (0, DynamoObjectHelper_1.mixin)(options.setValues || {}, options.where);
            (0, DynamoGlobalSecondaryIndexHelper_1.indexedColumns)(metadata, changedValues);
            (0, DynamoObjectHelper_1.mixin)(options.setValues, changedValues);
            if (options.setValues && options.setValues.id !== undefined) {
                delete options.setValues.id;
            }
            const params = param_helper_1.paramHelper.update(metadata.tablePath, options);
            return (0, DynamoClient_1.getDocumentClient)().update(params);
        });
    }
    /**
     * Finds entities that match given find options or conditions.
     */
    find(entityClassOrName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClassOrName);
            const params = param_helper_1.paramHelper.find(metadata.tablePath, options, metadata.indices);
            const results = (0, DynamoObjectHelper_1.isEmpty)(options.where)
                ? yield dbClient.scan(params)
                : yield dbClient.query(params);
            const items = unmarshallAll(results.Items);
            items.lastEvaluatedKey = results.LastEvaluatedKey;
            return items;
        });
    }
    /**
     * Finds entities that match given find options or conditions.
     */
    findAll(entityClassOrName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            delete options.limit;
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClassOrName);
            const params = param_helper_1.paramHelper.find(metadata.tablePath, options, metadata.indices);
            let items = [];
            let results = (0, DynamoObjectHelper_1.isEmpty)(options.where)
                ? yield dbClient.scan(params)
                : yield dbClient.query(params);
            items = items.concat(unmarshallAll(results.Items));
            while (results.LastEvaluatedKey) {
                params.ExclusiveStartKey = results.LastEvaluatedKey;
                results = (0, DynamoObjectHelper_1.isEmpty)(options.where)
                    ? yield dbClient.scan(params)
                    : yield dbClient.query(params);
                items = items.concat(unmarshallAll(results.Items || []));
            }
            return items;
        });
    }
    scan(entityClassOrName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClassOrName);
            const params = {
                TableName: metadata.tablePath
                // IndexName: findOptions.index,
                // KeyConditionExpression: FindOptions.toKeyConditionExpression(findOptions.where),
                // ExpressionAttributeValues: FindOptions.toExpressionAttributeValues(findOptions.where)
            };
            if (options.limit) {
                params.Limit = options.limit;
            }
            if (options.exclusiveStartKey) {
                params.ExclusiveStartKey = options.exclusiveStartKey;
            }
            const results = yield dbClient.scan(params);
            const items = unmarshallAll(results.Items);
            items.LastEvaluatedKey = results.LastEvaluatedKey;
            return items;
        });
    }
    /**
     * Finds first entity that matches given conditions and/or find options.
     */
    findOne(entityClass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClass);
            const id = typeof options === 'string' ? options : undefined;
            const findOneOptionsOrConditions = options;
            let findOptions;
            if (FindOptionsUtils_1.FindOptionsUtils.isFindOneOptions(findOneOptionsOrConditions)) {
                findOptions = new FindOptions_1.FindOptions();
                findOptions.where = findOneOptionsOrConditions.where;
                findOptions.limit = 1;
            }
            else {
                findOptions = new FindOptions_1.FindOptions();
                findOptions.where = { id };
                findOptions.limit = 1;
            }
            const params = param_helper_1.paramHelper.find(metadata.tablePath, findOptions, metadata.indices);
            const results = yield dbClient.query(params);
            const items = unmarshallAll(results.Items);
            return items.length > 0 ? items[0] : undefined;
        });
    }
    /**
     * Finds first entity that matches given conditions and/or find options.
     */
    findOneBy(entityClass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClass);
            const findOptions = new FindOptions_1.FindOptions();
            findOptions.where = options;
            findOptions.limit = 1;
            const params = param_helper_1.paramHelper.find(metadata.tablePath, findOptions, metadata.indices);
            const results = yield dbClient.query(params);
            const items = unmarshallAll(results.Items);
            return items.length > 0 ? items[0] : undefined;
        });
    }
    /**
     * Put a given entity into the database.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Executes fast and efficient INSERT query.
     * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
     * You can execute bulk inserts using this method.
     */
    put(target, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(entity)) {
                return this.putMany(target, entity);
            }
            else {
                return this.putOne(target, entity);
            }
        });
    }
    delete(targetOrEntity, criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(criteria)) {
                yield this.deleteMany(targetOrEntity, criteria);
            }
            else {
                yield this.deleteOne(targetOrEntity, criteria);
            }
            return {
                raw: {}
            };
        });
    }
    deleteAll(target, options, keyMapper) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = yield this.scan(target, { limit: 500 });
            while (items.length > 0) {
                const itemIds = items.map(keyMapper || this.createDefaultKeyMapper(target));
                yield this.deleteMany(target, itemIds);
                yield this.deleteAll(target, keyMapper);
                items = yield this.scan(target, { limit: 500 });
            }
        });
    }
    deleteAllBy(target, options, keyMapper) {
        options.limit = options.limit || 500;
        return this.deleteQueryBatch(target, options, keyMapper);
    }
    deleteQueryBatch(target, options, keyMapper) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.find(target, options);
            if (items.length > 0) {
                const metadata = this.connection.getMetadata(target);
                keyMapper = keyMapper || DEFAULT_KEY_MAPPER;
                const keys = items.map(keyMapper);
                yield this.deleteMany(metadata.tablePath, keys);
                yield this.deleteQueryBatch(target, options, keyMapper);
            }
        });
    }
    /**
     * Delete multiple documents on DynamoDB.
     */
    deleteMany(entityClassOrName, keys) {
        const metadata = this.connection.getMetadata(entityClassOrName);
        return this.dynamodbQueryRunner.deleteMany(metadata.tablePath, keys);
    }
    /**
     * Delete a document on DynamoDB.
     */
    deleteOne(entityClassOrName, key) {
        const metadata = this.connection.getMetadata(entityClassOrName);
        return this.dynamodbQueryRunner.deleteOne(metadata.tablePath, key);
    }
    /**
     * Put an array of documents into DynamoDB.
     */
    putMany(entityClassOrName, docs) {
        const metadata = this.connection.getMetadata(entityClassOrName);
        docs.forEach((doc) => {
            (0, DynamoGlobalSecondaryIndexHelper_1.indexedColumns)(metadata, doc);
        });
        return this.dynamodbQueryRunner.putMany(metadata.tablePath, docs);
    }
    /**
     * Put a single document into DynamoDB.
     */
    putOne(entityClassOrName, doc) {
        const metadata = this.connection.getMetadata(entityClassOrName);
        (0, DynamoGlobalSecondaryIndexHelper_1.indexedColumns)(metadata, doc);
        (0, DynamoGlobalSecondaryIndexHelper_1.populateGeneratedColumns)(metadata, doc);
        return this.dynamodbQueryRunner.putOne(metadata.tablePath, doc);
    }
    /**
     * Read from DynamoDB in batches.
     */
    batchRead(entityClassOrName, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClassOrName);
            const batches = DynamoBatchHelper_1.dynamoBatchHelper.batch(keys, 100);
            let items = [];
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const requestItems = {};
                requestItems[metadata.tablePath] = {
                    Keys: batch
                };
                const response = yield dbClient
                    .batchGet({
                    RequestItems: requestItems
                });
                if (response.Responses !== undefined) {
                    items = items.concat(response.Responses[metadata.tablePath]);
                }
            }
            return items;
        });
    }
    /**
     * Put an array of documents into DynamoDB in batches.
     */
    // TODO: ... how do we update the indexColumn values here ... ?
    batchWrite(entityClassOrName, writes) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            const metadata = this.connection.getMetadata(entityClassOrName);
            const batches = DynamoBatchHelper_1.dynamoBatchHelper.batch(writes, 25);
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const requestItems = {};
                requestItems[metadata.tablePath] = batch.map((write) => {
                    const request = {};
                    request[write.type] = {
                        Item: write.item
                    };
                    return request;
                });
                yield dbClient
                    .batchWrite({
                    RequestItems: requestItems
                });
            }
        });
    }
    /**
     * Execute a statement on DynamoDB.
     */
    executeStatement(statement, params, nextToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbClient = (0, DynamoClient_1.getDocumentClient)();
            return dbClient.executeStatement({
                Statement: statement,
                Parameters: params,
                NextToken: nextToken
            });
        });
    }
}
exports.DynamoEntityManager = DynamoEntityManager;
