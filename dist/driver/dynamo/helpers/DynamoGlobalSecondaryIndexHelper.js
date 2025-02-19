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
exports.addGlobalSecondaryIndex = exports.deleteGlobalSecondaryIndex = exports.updateGlobalSecondaryIndexes = exports.waitUntilActive = exports.buildGlobalSecondaryIndexes = exports.buildAttributeDefinitions = exports.populateGeneratedColumns = exports.indexedColumns = exports.buildPartitionKey = void 0;
const uuid_1 = require("uuid");
const PlatformTools_1 = require("typeorm/platform/PlatformTools");
const buildPartitionKey = (columns) => {
    return columns
        .map((column) => {
        return column.propertyName;
    })
        .join('#');
};
exports.buildPartitionKey = buildPartitionKey;
const partitionKeyColumns = (columns, doc) => {
    if (columns.length > 1) {
        const partitionKey = (0, exports.buildPartitionKey)(columns);
        doc[partitionKey] = columns.map((column) => {
            const value = doc[column.propertyName];
            if (value === undefined) {
                throw new Error(`value not provided for indexed column: ${column.propertyName}`);
            }
            return value;
        }).join('#');
    }
};
const hasSortValue = (doc, columns) => {
    if (columns && columns.length > 0) {
        for (const column of columns) {
            if (doc[column] !== undefined) {
                return true;
            }
        }
    }
};
const sortKeyColumns = (sortKey, doc) => {
    const columns = sortKey.split('#');
    if (columns.length > 1) {
        if (hasSortValue(doc, columns)) {
            doc[sortKey] = columns
                .map((column) => {
                return doc[column];
            })
                .join('#');
        }
    }
};
const indexedColumns = (metadata, doc) => {
    const indices = metadata.indices || [];
    for (let i = 0; i < indices.length; i += 1) {
        const index = indices[i];
        const columns = index.columns || [];
        partitionKeyColumns(columns, doc);
        sortKeyColumns(index.where || '', doc);
    }
};
exports.indexedColumns = indexedColumns;
const populateGeneratedColumns = (metadata, doc) => {
    const generatedColumns = metadata.generatedColumns || [];
    for (let i = 0; i < generatedColumns.length; i += 1) {
        const generatedColumn = generatedColumns[i];
        const value = generatedColumn.generationStrategy === 'uuid' ? (0, uuid_1.v4)() : 1;
        if (generatedColumn.generationStrategy !== 'uuid') {
            console.warn(`generationStrategy is not supported by dynamodb: ${generatedColumn.generationStrategy}`);
        }
        doc[generatedColumn.propertyName] =
            doc[generatedColumn.propertyName] || value;
    }
};
exports.populateGeneratedColumns = populateGeneratedColumns;
const primaryKeyAttributes = (metadata, driver, attributeMap) => {
    for (let i = 0; i < metadata.primaryColumns.length; i += 1) {
        const primaryColumn = metadata.primaryColumns[i];
        attributeMap.set(primaryColumn.propertyName, {
            AttributeName: primaryColumn.propertyName,
            AttributeType: driver.normalizeDynamodbType(primaryColumn)
        });
    }
};
const keyAttributes = (metadata, driver, key, attributeMap) => {
    if (key.includes('#')) {
        attributeMap.set(key, {
            AttributeName: key,
            AttributeType: 'S'
        });
    }
    else {
        const column = metadata.columns.find((column) => {
            return column.propertyName === key;
        });
        if (column) {
            attributeMap.set(key, {
                AttributeName: key,
                AttributeType: driver.normalizeDynamodbType(column)
            });
        }
    }
};
const partitionKeyAttributes = (metadata, driver, attributeMap) => {
    const indices = metadata.indices || [];
    for (let i = 0; i < indices.length; i += 1) {
        const index = indices[i];
        const columns = index.columns || [];
        const partitionKey = (0, exports.buildPartitionKey)(columns);
        keyAttributes(metadata, driver, partitionKey, attributeMap);
        const sortKey = index.where || '';
        keyAttributes(metadata, driver, sortKey, attributeMap);
    }
};
const buildAttributeDefinitions = (metadata, driver) => {
    const attributeMap = new Map();
    primaryKeyAttributes(metadata, driver, attributeMap);
    partitionKeyAttributes(metadata, driver, attributeMap);
    return Array.from(attributeMap.values());
};
exports.buildAttributeDefinitions = buildAttributeDefinitions;
const buildGlobalSecondaryIndexes = (metadata) => {
    const globalSecondaryIndexes = [];
    const indices = metadata.indices || [];
    for (let i = 0; i < indices.length; i += 1) {
        const index = indices[i];
        const globalSecondaryIndex = {};
        globalSecondaryIndex.IndexName = index.name;
        globalSecondaryIndex.KeySchema = [];
        const columns = index.columns || [];
        const partitionKey = (0, exports.buildPartitionKey)(columns);
        globalSecondaryIndex.KeySchema.push({
            AttributeName: partitionKey,
            KeyType: 'HASH'
        });
        const sortKey = index.where || '';
        if (sortKey) {
            globalSecondaryIndex.KeySchema.push({
                AttributeName: sortKey,
                KeyType: 'RANGE'
            });
        }
        globalSecondaryIndex.Projection = {
            ProjectionType: 'ALL'
        };
        globalSecondaryIndexes.push(globalSecondaryIndex);
    }
    return globalSecondaryIndexes.length > 0
        ? globalSecondaryIndexes
        : undefined;
};
exports.buildGlobalSecondaryIndexes = buildGlobalSecondaryIndexes;
const wait = (seconds) => {
    return new Promise((resolve) => {
        setTimeout(function () {
            resolve();
        }, seconds);
    });
};
const waitUntilActive = (db, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    let retries = 10;
    while (retries > 0) {
        try {
            const result = yield db
                .describeTable({
                TableName: tableName
            });
            const status = result.Table.TableStatus;
            if (status === 'ACTIVE') {
                break;
            }
            yield wait(10);
        }
        catch (error) {
            const _error = error;
            PlatformTools_1.PlatformTools.logError(`failed to describe table: ${tableName}`, _error);
        }
        retries -= 1;
    }
});
exports.waitUntilActive = waitUntilActive;
const updateGlobalSecondaryIndexes = (db, tableName, attributeDefinitions, globalSecondaryIndexes) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield db
            .describeTable({
            TableName: tableName
        });
        const existingGlobalSecondaryIndexes = existing.Table.GlobalSecondaryIndexes || [];
        const map = new Map();
        existingGlobalSecondaryIndexes.forEach((existingGlobalSecondaryIndex) => {
            map.set(existingGlobalSecondaryIndex.IndexName, existingGlobalSecondaryIndex);
        });
        for (let i = 0; i < globalSecondaryIndexes.length; i += 1) {
            const globalSecondaryIndex = globalSecondaryIndexes[i];
            const existing = map.get(globalSecondaryIndex.IndexName);
            if (existing) {
                // has anything changed?
                const keySchemaChanged = JSON.stringify(existing.KeySchema) !==
                    JSON.stringify(globalSecondaryIndex.KeySchema);
                const projectionChanged = JSON.stringify(existing.Projection) !==
                    JSON.stringify(globalSecondaryIndex.Projection);
                if (keySchemaChanged || projectionChanged) {
                    yield (0, exports.deleteGlobalSecondaryIndex)(db, tableName, globalSecondaryIndex.IndexName);
                    yield (0, exports.addGlobalSecondaryIndex)(db, tableName, attributeDefinitions, globalSecondaryIndex);
                }
            }
            else {
                yield (0, exports.addGlobalSecondaryIndex)(db, tableName, attributeDefinitions, globalSecondaryIndex);
            }
            map.delete(globalSecondaryIndex.IndexName);
        }
        const deletedIndexes = Array.from(map.values());
        for (let i = 0; i < deletedIndexes.length; i += 1) {
            const deletedIndex = deletedIndexes[i];
            yield (0, exports.deleteGlobalSecondaryIndex)(db, tableName, deletedIndex.IndexName);
        }
    }
    catch (error) {
        const _error = error;
        PlatformTools_1.PlatformTools.logError('failed to update table indexes.', _error);
    }
});
exports.updateGlobalSecondaryIndexes = updateGlobalSecondaryIndexes;
const deleteGlobalSecondaryIndex = (db, tableName, indexName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        PlatformTools_1.PlatformTools.logInfo('deleting index:', indexName);
        yield db
            .updateTable({
            TableName: tableName,
            GlobalSecondaryIndexUpdates: [
                {
                    Delete: { IndexName: indexName }
                }
            ]
        });
        yield (0, exports.waitUntilActive)(db, tableName);
    }
    catch (error) {
        const _error = error;
        PlatformTools_1.PlatformTools.logError(`failed to update table: ${tableName}`, _error);
    }
});
exports.deleteGlobalSecondaryIndex = deleteGlobalSecondaryIndex;
const addGlobalSecondaryIndex = (db, tableName, attributeDefinitions, globalSecondaryIndex) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        PlatformTools_1.PlatformTools.logInfo('creating index:', globalSecondaryIndex.IndexName);
        yield db
            .updateTable({
            TableName: tableName,
            AttributeDefinitions: attributeDefinitions,
            GlobalSecondaryIndexUpdates: [
                {
                    Create: {
                        KeySchema: globalSecondaryIndex.KeySchema,
                        Projection: globalSecondaryIndex.Projection,
                        IndexName: globalSecondaryIndex.IndexName
                    }
                }
            ]
        });
        yield (0, exports.waitUntilActive)(db, tableName);
    }
    catch (error) {
        const _error = error;
        PlatformTools_1.PlatformTools.logError(`failed to create index: ${globalSecondaryIndex.IndexName}`, _error);
    }
});
exports.addGlobalSecondaryIndex = addGlobalSecondaryIndex;
