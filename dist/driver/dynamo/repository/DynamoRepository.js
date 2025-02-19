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
exports.DynamoRepository = void 0;
const Repository_1 = require("typeorm/repository/Repository");
const DynamoReadStream_1 = require("../DynamoReadStream");
class DynamoRepository extends Repository_1.Repository {
    /**
     * Entity metadata of the entity current repository manages.
     */
    get metadata() {
        return this.manager.connection.getMetadata(this.target);
    }
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    createQueryBuilder(alias, queryRunner) {
        return this.manager.createQueryBuilder(this.metadata.target, alias || this.metadata.targetName, queryRunner || this.queryRunner);
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne(key);
        });
    }
    find(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.find(this.metadata.tableName, options);
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.findAll(this.metadata.tableName, options);
        });
    }
    /**
     * Finds first entity by a given find options.
     * If entity was not found in the database - returns null.
     */
    findOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.findOne(this.metadata.target, options);
        });
    }
    /**
     * Finds first entity by a given find options.
     * If entity was not found in the database - returns null.
     */
    findOneBy(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.findOneBy(this.metadata.target, where);
        });
    }
    add(options) {
        return this.manager.update(this.metadata.target, {
            addValues: options.values,
            where: options.where
        });
    }
    scan(options) {
        return this.manager.scan(this.metadata.tableName, options);
    }
    /**
     * Saves one or many given entities.
     */
    save(entityOrEntities, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.manager.put(this.metadata.target, entityOrEntities);
            return entityOrEntities;
        });
    }
    put(content) {
        if (Array.isArray(content)) {
            return this.putMany(content);
        }
        return this.manager.put(this.metadata.tableName, content);
    }
    putMany(content) {
        return this.manager.putMany(this.metadata.tableName, content);
    }
    putOne(content) {
        return this.manager.putOne(this.metadata.tableName, content);
    }
    delete(criteria) {
        return this.manager.delete(this.metadata.tableName, criteria);
    }
    deleteOne(key) {
        return this.manager.deleteOne(this.metadata.tableName, key);
    }
    deleteMany(keys) {
        return this.manager.deleteMany(this.metadata.tableName, keys);
    }
    deleteAll(keyMapper) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.deleteAll(this.metadata.tableName, keyMapper);
        });
    }
    deleteAllBy(options, keyMapper) {
        return this.manager.deleteAllBy(this.metadata.tableName, options, keyMapper);
    }
    deleteQueryBatch(options, keyMapper) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.deleteQueryBatch(this.metadata.tableName, options, keyMapper);
        });
    }
    batchRead(keys) {
        return this.manager.batchRead(this.metadata.tableName, keys);
    }
    batchWrite(writes) {
        return this.manager.batchWrite(this.metadata.tableName, writes);
    }
    executeStatement(statement, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.manager.executeStatement(statement, params);
            const results = result.Items;
            while (result.NextToken) {
                result = yield this.manager.executeStatement(statement, params, result.NextToken);
                results.push(...result.Items);
            }
            return results;
        });
    }
    /**
     * @deprecated use put(...) or updateExpression(...) for dynamodb.
     */
    update(criteria, partialEntity) {
        throw new Error('use repository.updateExpression(...) for dynamodb.');
    }
    updateExpression(options) {
        return this.manager.update(this.metadata.target, options);
    }
    streamAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return new DynamoReadStream_1.DynamoReadStream(this, { limit: 500 });
        });
    }
}
exports.DynamoRepository = DynamoRepository;
