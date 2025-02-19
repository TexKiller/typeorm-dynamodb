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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoQueryRunner = void 0;
const PlatformTools_1 = require("typeorm/platform/PlatformTools");
const Broadcaster_1 = require("typeorm/subscriber/Broadcaster");
const typeorm_1 = require("typeorm");
const DynamoBatchHelper_1 = require("./helpers/DynamoBatchHelper");
const tiny_async_pool_1 = __importDefault(require("tiny-async-pool"));
const DynamoClient_1 = require("./DynamoClient");
class DeleteManyOptions {
}
class PutManyOptions {
}
const batchDelete = (tableName, batch) => __awaiter(void 0, void 0, void 0, function* () {
    const RequestItems = {};
    RequestItems[tableName] = batch.map((Key) => {
        return {
            DeleteRequest: {
                Key
            }
        };
    });
    return (0, DynamoClient_1.getDocumentClient)()
        .batchWrite({
        RequestItems
    });
});
const batchWrite = (tableName, batch) => __awaiter(void 0, void 0, void 0, function* () {
    const RequestItems = {};
    RequestItems[tableName] = batch.map((Item) => {
        return {
            PutRequest: {
                Item
            }
        };
    });
    return (0, DynamoClient_1.getDocumentClient)()
        .batchWrite({
        RequestItems
    });
});
const asyncPoolAll = (concurrency, iterable, iteratorFn) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const results = [];
    try {
        for (var _b = __asyncValues((0, tiny_async_pool_1.default)(concurrency, iterable, iteratorFn)), _c; _c = yield _b.next(), !_c.done;) {
            const result = _c.value;
            results.push(result);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
});
class DynamoQueryRunner {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(connection, databaseConnection) {
        /**
         * Indicates if connection for this query runner is released.
         * Once its released, query runner cannot run queries anymore.
         * Always false for DynamoDB since DynamoDB has a single query executor instance.
         */
        this.isReleased = false;
        /**
         * Indicates if transaction is active in this query executor.
         * Always false for DynamoDB since DynamoDB does not support transactions.
         */
        this.isTransactionActive = false;
        /**
         * Stores temporarily user data.
         * Useful for sharing data with subscribers.
         */
        this.data = {};
        this.connection = connection;
        this.databaseConnection = databaseConnection;
        this.broadcaster = new Broadcaster_1.Broadcaster(this);
    }
    clearDatabase(database) {
        return __awaiter(this, void 0, void 0, function* () {
            const AWS = PlatformTools_1.PlatformTools.load('aws-sdk');
            const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
            const tables = yield db.listTables();
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const tableName = table.TableName;
                if (tableName.startsWith(database)) {
                    yield db.deleteTable({
                        TableName: table.TableName
                    });
                }
            }
        });
    }
    stream(query, parameters, onEnd, onError) {
        throw new Error('Method not implemented.');
    }
    getView(viewPath) {
        throw new Error('Method not implemented.');
    }
    getViews(viewPaths) {
        throw new Error('Method not implemented.');
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Delete multiple documents on DynamoDB.
     */
    deleteMany(tableName, keys, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (keys.length > 0) {
                const batchOptions = options || { maxConcurrency: 8 };
                const batches = DynamoBatchHelper_1.dynamoBatchHelper.batch(keys);
                yield asyncPoolAll(batchOptions.maxConcurrency, batches, (batch) => {
                    return batchDelete(tableName, batch);
                });
            }
        });
    }
    /**
     * Delete a document on DynamoDB.
     */
    deleteOne(tableName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                TableName: tableName,
                Key: key
            };
            yield (0, DynamoClient_1.getDocumentClient)().delete(params);
        });
    }
    /**
     * Inserts an array of documents into DynamoDB.
     */
    putMany(tableName, docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (docs.length > 0) {
                const batchOptions = options || { maxConcurrency: 8 };
                const batches = DynamoBatchHelper_1.dynamoBatchHelper.batch(docs);
                yield asyncPoolAll(batchOptions.maxConcurrency, batches, (batch) => {
                    return batchWrite(tableName, batch);
                });
            }
        });
    }
    /**
     * Inserts a single document into DynamoDB.
     */
    putOne(tableName, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                TableName: tableName,
                Item: doc
            };
            yield (0, DynamoClient_1.getDocumentClient)().put(params);
            return doc;
        });
    }
    /**
     * For DynamoDB database we don't create connection, because its single connection already created by a driver.
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * For DynamoDB database we don't release connection, because its single connection.
     */
    release() {
        return __awaiter(this, void 0, void 0, function* () {
            // releasing connection are not supported by DynamoDB driver, so simply don't do anything here
        });
    }
    /**
     * Starts transaction.
     */
    startTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            // transactions are not supported by DynamoDB driver, so simply don't do anything here
        });
    }
    /**
     * Commits transaction.
     */
    commitTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            // transactions are not supported by DynamoDB driver, so simply don't do anything here
        });
    }
    /**
     * Rollbacks transaction.
     */
    rollbackTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            // transactions are not supported by DynamoDB driver, so simply don't do anything here
        });
    }
    /**
     * Executes a given SQL query.
     */
    query(query, parameters) {
        throw new typeorm_1.TypeORMError('Executing SQL query is not supported by DynamoDB driver.');
    }
    /**
     * Returns raw data stream.
     */
    // stream (query: string, parameters?: any[], onEnd?: Function, onError?: Function): Promise<ReadStream> {
    //     throw new TypeORMError('Stream is not supported yet. Use watch instead.')
    // }
    /**
     * Returns all available database names including system databases.
     */
    getDatabases() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Returns all available schema names including system schemas.
     * If database parameter specified, returns schemas of that database.
     */
    getSchemas(database) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Loads given table's data from the database.
     */
    getTable(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    getTables(collectionNames) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Checks if database with the given name exist.
     */
    hasDatabase(database) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Check database queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Loads currently using database
     */
    getCurrentDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Check database queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Checks if schema with the given name exist.
     */
    hasSchema(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Check schema queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Loads currently using database schema
     */
    getCurrentSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Check schema queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Checks if table with the given name exist in the database.
     */
    hasTable(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Check schema queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Checks if column with the given name exist in the given table.
     */
    hasColumn(tableOrName, columnName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a database if it's not created.
     */
    createDatabase(database) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Database create queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops database.
     */
    dropDatabase(database, ifExist) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Database drop queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new table schema.
     */
    createSchema(schemaPath, ifNotExist) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema create queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops table schema.
     */
    dropSchema(schemaPath, ifExist) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema drop queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new table from the given table and columns inside it.
     */
    createTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops the table.
     */
    dropTable(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new view.
     */
    createView(view) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops the view.
     */
    dropView(target) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Renames the given table.
     */
    renameTable(oldTableOrName, newTableOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Renames the given table.
     */
    changeTableComment(tableOrName, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new column from the column in the table.
     */
    addColumn(tableOrName, column) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new columns from the column in the table.
     */
    addColumns(tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Renames column in the given table.
     */
    renameColumn(tableOrName, oldTableColumnOrName, newTableColumnOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Changes a column in the table.
     */
    changeColumn(tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Changes a column in the table.
     */
    changeColumns(tableOrName, changedColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops column in the table.
     */
    dropColumn(tableOrName, columnOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops the columns in the table.
     */
    dropColumns(tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new primary key.
     */
    createPrimaryKey(tableOrName, columnNames) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Updates composite primary keys.
     */
    updatePrimaryKeys(tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops a primary key.
     */
    dropPrimaryKey(tableOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new unique constraint.
     */
    createUniqueConstraint(tableOrName, uniqueConstraint) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new unique constraints.
     */
    createUniqueConstraints(tableOrName, uniqueConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops an unique constraint.
     */
    dropUniqueConstraint(tableOrName, uniqueOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops an unique constraints.
     */
    dropUniqueConstraints(tableOrName, uniqueConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new check constraint.
     */
    createCheckConstraint(tableOrName, checkConstraint) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new check constraints.
     */
    createCheckConstraints(tableOrName, checkConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops check constraint.
     */
    dropCheckConstraint(tableOrName, checkOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops check constraints.
     */
    dropCheckConstraints(tableOrName, checkConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new exclusion constraint.
     */
    createExclusionConstraint(tableOrName, exclusionConstraint) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new exclusion constraints.
     */
    createExclusionConstraints(tableOrName, exclusionConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops exclusion constraint.
     */
    dropExclusionConstraint(tableOrName, exclusionOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops exclusion constraints.
     */
    dropExclusionConstraints(tableOrName, exclusionConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new foreign key.
     */
    createForeignKey(tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new foreign keys.
     */
    createForeignKeys(tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops a foreign key from the table.
     */
    dropForeignKey(tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops a foreign keys from the table.
     */
    dropForeignKeys(tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new index.
     */
    createIndex(tableOrName, index) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Creates a new indices
     */
    createIndices(tableOrName, indices) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops an index from the table.
     */
    dropIndex(collectionName, indexName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops an indices from the table.
     */
    dropIndices(tableOrName, indices) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('Schema update queries are not supported by DynamoDB driver.');
        });
    }
    /**
     * Drops collection.
     */
    clearTable(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, DynamoClient_1.getDocumentClient)()
                .deleteTable({
                TableName: tableName
            });
        });
    }
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    enableSqlMemory() {
        throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
    }
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    disableSqlMemory() {
        throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
    }
    /**
     * Flushes all memorized sqls.
     */
    clearSqlMemory() {
        throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
    }
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    getMemorySql() {
        throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
    }
    /**
     * Executes up sql queries.
     */
    executeMemoryUpSql() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
        });
    }
    /**
     * Executes down sql queries.
     */
    executeMemoryDownSql() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
        });
    }
    getReplicationMode() {
        return 'master';
    }
    /**
     * Called before migrations are run.
     */
    beforeMigration() {
        return Promise.resolve();
    }
    /**
     * Called after migrations are run.
     */
    afterMigration() {
        return Promise.resolve();
    }
}
exports.DynamoQueryRunner = DynamoQueryRunner;
