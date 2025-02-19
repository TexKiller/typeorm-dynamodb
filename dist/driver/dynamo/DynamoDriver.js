"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDriver = void 0;
const typeorm_1 = require("typeorm");
const DynamoSchemaBuilder_1 = require("./DynamoSchemaBuilder");
const DynamoQueryRunner_1 = require("./DynamoQueryRunner");
const ObjectUtils_1 = require("typeorm/util/ObjectUtils");
const DriverUtils_1 = require("typeorm/driver/DriverUtils");
const ApplyValueTransformers_1 = require("typeorm/util/ApplyValueTransformers");
const DynamoClient_1 = require("./DynamoClient");
/**
 * Organizes communication with MongoDB.
 */
class DynamoDriver {
    // constructor(connection: Connection) {
    //     this.connection = connection;
    // }
    constructor(connection) {
        this.connection = connection;
        this.supportedDataTypes = ['string', 'number', 'binary'];
        this.supportedUpsertTypes = [];
        this.dataTypeDefaults = {};
        this.spatialTypes = [];
        /**
         * Gets list of column data types that support length by a driver.
         */
        this.withLengthColumnTypes = ['string'];
        this.withPrecisionColumnTypes = [];
        this.withScaleColumnTypes = [];
        /**
         * Orm has special columns and we need to know what database column types should be for those types.
         * Column types are driver dependant.
         */
        this.mappedDataTypes = {
            createDate: 'varchar',
            createDateDefault: 'now()',
            updateDate: 'varchar',
            updateDateDefault: 'now()',
            deleteDate: 'varchar',
            deleteDateNullable: true,
            version: 'varchar',
            treeLevel: 'varchar',
            migrationId: 'varchar',
            migrationName: 'varchar',
            migrationTimestamp: 'varchar',
            cacheId: 'varchar',
            cacheIdentifier: 'varchar',
            cacheTime: 'varchar',
            cacheDuration: 'varchar',
            cacheQuery: 'varchar',
            cacheResult: 'varchar',
            metadataType: 'varchar',
            metadataDatabase: 'varchar',
            metadataSchema: 'varchar',
            metadataTable: 'varchar',
            metadataName: 'varchar',
            metadataValue: 'varchar'
        };
        this.options = connection.options;
        // validate options to make sure everything is correct and driver will be able to establish connection
        this.validateOptions(connection.options);
        // load mongodb package
        this.loadDependencies();
        this.database = DriverUtils_1.DriverUtils.buildMongoDBDriverOptions(this.options).database;
    }
    /**
     * Validate driver options to make sure everything is correct and driver will be able to establish connection.
     */
    validateOptions(options) {
        // todo: fix
        // if (!options.url) {
        //     if (!options.database)
        //         throw new DriverOptionNotSetError("database");
        // }
    }
    /**
     * Loads all driver dependencies.
     */
    loadDependencies() {
        try {
            this.dynamodb = this.options.driver || (0, DynamoClient_1.getDocumentClient)();
        }
        catch (e) {
            throw new typeorm_1.DriverPackageNotInstalledError('DynamoDB', 'dynamodb');
        }
    }
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.queryRunner = new DynamoQueryRunner_1.DynamoQueryRunner(this.connection, undefined);
                ObjectUtils_1.ObjectUtils.assign(this.queryRunner, {
                    manager: this.connection.manager
                });
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    afterConnect() {
        return Promise.resolve();
    }
    disconnect() {
        return Promise.resolve();
    }
    createSchemaBuilder() {
        return new DynamoSchemaBuilder_1.DynamoSchemaBuilder(this.connection);
    }
    createQueryRunner(mode) {
        return this.queryRunner;
    }
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    escapeQueryWithParameters(sql, parameters, nativeParameters) {
        throw new typeorm_1.TypeORMError('This operation is not supported by DynamoDB driver.');
    }
    escape(name) {
        return name;
    }
    buildTableName(tableName, schema, database) {
        const parts = [tableName];
        if (schema) {
            parts.unshift(schema);
        }
        if (database) {
            parts.unshift(database);
        }
        return parts.join('.');
    }
    /**
     * Parse a target table name or other types and return a normalized table definition.
     */
    parseTableName(target) {
        if (typeorm_1.InstanceChecker.isEntityMetadata(target)) {
            return {
                tableName: target.tableName
            };
        }
        if (typeorm_1.InstanceChecker.isTable(target) || typeorm_1.InstanceChecker.isView(target)) {
            return {
                tableName: target.name
            };
        }
        if (typeorm_1.InstanceChecker.isTableForeignKey(target)) {
            return {
                tableName: target.referencedTableName
            };
        }
        return {
            tableName: target
        };
    }
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    preparePersistentValue(value, columnMetadata) {
        if (columnMetadata.transformer) {
            value = ApplyValueTransformers_1.ApplyValueTransformers.transformTo(columnMetadata.transformer, value);
        }
        return value;
    }
    /**
     * Prepares given value to a value to be persisted, based on its column type or metadata.
     */
    prepareHydratedValue(value, columnMetadata) {
        if (columnMetadata.transformer) {
            value = ApplyValueTransformers_1.ApplyValueTransformers.transformFrom(columnMetadata.transformer, value);
        }
        return value;
    }
    normalizeDynamodbType(column) {
        const type = this.normalizeType(column);
        if (type === 'string') {
            return 'S';
        }
        else if (type === 'number') {
            return 'N';
        }
        else if (type === 'binary') {
            return 'B';
        }
        else {
            throw new Error(`Type not supported by DynamoDB driver: ${type}`);
        }
    }
    normalizeType(column) {
        if (column.type === Number ||
            column.type === 'int' ||
            column.type === 'int4') {
            return 'number';
        }
        else if (column.type === String ||
            column.type === 'varchar' ||
            column.type === 'varchar2') {
            return 'string';
        }
        else if (column.type === Date ||
            column.type === 'timestamp' ||
            column.type === 'date' ||
            column.type === 'datetime') {
            return 'string';
        }
        else if (column.type === 'timestamptz') {
            return 'string';
        }
        else if (column.type === 'time') {
            return 'string';
        }
        else if (column.type === 'timetz') {
            return 'string';
        }
        else if (column.type === Boolean || column.type === 'bool') {
            return 'string';
        }
        else if (column.type === 'simple-array') {
            return 'string';
        }
        else if (column.type === 'simple-json') {
            return 'string';
        }
        else if (column.type === 'simple-enum') {
            return 'string';
        }
        else if (column.type === 'int2') {
            return 'number';
        }
        else if (column.type === 'int8') {
            return 'string';
        }
        else if (column.type === 'decimal') {
            return 'string';
        }
        else if (column.type === 'float8' || column.type === 'float') {
            return 'string';
        }
        else if (column.type === 'float4') {
            return 'string';
        }
        else if (column.type === 'char') {
            return 'string';
        }
        else if (column.type === 'varbit') {
            return 'string';
        }
        else {
            return column.type || '';
        }
    }
    /**
     * Normalizes "default" value of the column.
     */
    normalizeDefault(columnMetadata) {
        throw new typeorm_1.TypeORMError('MongoDB is schema-less, not supported by this driver.');
    }
    /**
     * Normalizes "isUnique" value of the column.
     */
    normalizeIsUnique(column) {
        throw new typeorm_1.TypeORMError('MongoDB is schema-less, not supported by this driver.');
    }
    /**
     * Calculates column length taking into account the default length values.
     */
    getColumnLength(column) {
        throw new typeorm_1.TypeORMError('MongoDB is schema-less, not supported by this driver.');
    }
    /**
     * Normalizes "default" value of the column.
     */
    createFullType(column) {
        throw new typeorm_1.TypeORMError('MongoDB is schema-less, not supported by this driver.');
    }
    /**
     * Obtains a new database connection to a master server.
     * Used for replication.
     * If replication is not setup then returns default connection's database connection.
     */
    obtainMasterConnection() {
        return Promise.resolve();
    }
    /**
     * Obtains a new database connection to a slave server.
     * Used for replication.
     * If replication is not setup then returns master (default) connection's database connection.
     */
    obtainSlaveConnection() {
        return Promise.resolve();
    }
    /**
     * Creates generated map of values generated or returned by database after INSERT query.
     */
    createGeneratedMap(metadata, insertedId) {
        return metadata.objectIdColumn.createValueMap(insertedId);
    }
    /**
     * Differentiate columns of this table and columns from the given column metadatas columns
     * and returns only changed.
     */
    findChangedColumns(tableColumns, columnMetadatas) {
        throw new typeorm_1.TypeORMError('DynamoDB is schema-less, not supported by this driver.');
    }
    isReturningSqlSupported() {
        return false;
    }
    isUUIDGenerationSupported() {
        return false;
    }
    isFullTextColumnTypeSupported() {
        return false;
    }
    createParameter(parameterName, index) {
        return '';
    }
}
exports.DynamoDriver = DynamoDriver;
