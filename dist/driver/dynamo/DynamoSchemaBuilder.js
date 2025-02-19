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
exports.DynamoSchemaBuilder = exports.metadataArgsStorage = void 0;
const typeorm_1 = require("typeorm");
const SqlInMemory_1 = require("typeorm/driver/SqlInMemory");
const PlatformTools_1 = require("typeorm/platform/PlatformTools");
const DynamoGlobalSecondaryIndexHelper_1 = require("./helpers/DynamoGlobalSecondaryIndexHelper");
const DynamoClient_1 = require("./DynamoClient");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
exports.metadataArgsStorage = (0, typeorm_1.getMetadataArgsStorage)();
/**
 * Creates complete tables schemas in the database based on the entity metadatas.
 *
 * Steps how schema is being built:
 * 1. load list of all tables with complete column and keys information from the db
 * 2. drop all (old) foreign keys that exist in the table, but does not exist in the metadata
 * 3. create new tables that does not exist in the db, but exist in the metadata
 * 4. drop all columns exist (left old) in the db table, but does not exist in the metadata
 * 5. add columns from metadata which does not exist in the table
 * 6. update all exist columns which metadata has changed
 * 7. update primary keys - update old and create new primary key from changed columns
 * 8. create foreign keys which does not exist in the table yet
 * 9. create indices which are missing in db yet, and drops indices which exist in the db, but does not exist in the metadata anymore
 */
class DynamoSchemaBuilder {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates complete schemas for the given entity metadatas.
     */
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = (0, DynamoClient_1.getDocumentClient)();
            const driver = this.connection.driver;
            const metadatas = this.connection.entityMetadatas;
            for (let i = 0; i < metadatas.length; i += 1) {
                const metadata = metadatas[i];
                const keySchema = [];
                for (let i = 0; i < metadata.primaryColumns.length; i += 1) {
                    const primaryColumn = metadata.primaryColumns[i];
                    keySchema.push({
                        AttributeName: primaryColumn.propertyName,
                        KeyType: 'HASH'
                    });
                }
                const globalSecondaryIndexes = (0, DynamoGlobalSecondaryIndexHelper_1.buildGlobalSecondaryIndexes)(metadata) || [];
                const attributeDefinitions = (0, DynamoGlobalSecondaryIndexHelper_1.buildAttributeDefinitions)(metadata, driver);
                const schema = {
                    AttributeDefinitions: attributeDefinitions,
                    BillingMode: client_dynamodb_1.BillingMode.PAY_PER_REQUEST,
                    TableName: driver.buildTableName(metadata.tableName, metadata.schema, metadata.database),
                    KeySchema: keySchema,
                    GlobalSecondaryIndexes: globalSecondaryIndexes.length > 0 ? globalSecondaryIndexes : undefined
                };
                try {
                    yield client.createTable(schema);
                }
                catch (error) {
                    const _error = error;
                    if (_error && _error.name && _error.name === 'ResourceInUseException') {
                        PlatformTools_1.PlatformTools.logInfo('table already exists: ', metadata.tableName);
                        yield (0, DynamoGlobalSecondaryIndexHelper_1.updateGlobalSecondaryIndexes)(client, schema.TableName, attributeDefinitions, globalSecondaryIndexes);
                    }
                    else {
                        PlatformTools_1.PlatformTools.logError('error creating table: ', error);
                    }
                }
            }
        });
    }
    /**
     * Returns query to be executed by schema builder.
     */
    log() {
        return Promise.resolve(new SqlInMemory_1.SqlInMemory());
    }
}
exports.DynamoSchemaBuilder = DynamoSchemaBuilder;
