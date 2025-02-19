import { ColumnType, DataSource, DataSourceOptions, EntityMetadata, ObjectLiteral, ReplicationMode, Table, TableColumn, TableForeignKey } from 'typeorm';
import { Driver } from '../../typeorm/driver/Driver';
import { DataTypeDefaults } from 'typeorm/driver/types/DataTypeDefaults';
import { MappedColumnTypes } from 'typeorm/driver/types/MappedColumnTypes';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { SchemaBuilder } from 'typeorm/schema-builder/SchemaBuilder';
import { View } from 'typeorm/schema-builder/view/View';
import { DynamoQueryRunner } from './DynamoQueryRunner';
import { CteCapabilities } from 'typeorm/driver/types/CteCapabilities';
import { UpsertType } from 'typeorm/driver/types/UpsertType';
import { DynamoConnectionOptions } from './DynamoConnectionOptions';
/**
 * Organizes communication with MongoDB.
 */
export declare class DynamoDriver implements Driver {
    protected connection: DataSource;
    /**
     * Underlying dynamodb library.
     */
    dynamodb: any;
    /**
     * Connection options.
     */
    options: DynamoConnectionOptions;
    database?: string | undefined;
    schema?: string | undefined;
    isReplicated: boolean;
    treeSupport: boolean;
    transactionSupport: 'simple' | 'nested' | 'none';
    supportedDataTypes: ColumnType[];
    supportedUpsertTypes: UpsertType[];
    dataTypeDefaults: DataTypeDefaults;
    spatialTypes: ColumnType[];
    /**
     * Gets list of column data types that support length by a driver.
     */
    withLengthColumnTypes: ColumnType[];
    withPrecisionColumnTypes: ColumnType[];
    withScaleColumnTypes: ColumnType[];
    /**
     * Orm has special columns and we need to know what database column types should be for those types.
     * Column types are driver dependant.
     */
    mappedDataTypes: MappedColumnTypes;
    maxAliasLength?: number | undefined;
    /**
     * DynamoDB does not require to dynamically create query runner each time,
     * because it does not have a regular connection pool as RDBMS systems have.
     */
    queryRunner?: DynamoQueryRunner;
    constructor(connection: DataSource);
    supportedUpsertType?: UpsertType | undefined;
    cteCapabilities: CteCapabilities;
    /**
     * Validate driver options to make sure everything is correct and driver will be able to establish connection.
     */
    protected validateOptions(options: DataSourceOptions): void;
    /**
     * Loads all driver dependencies.
     */
    protected loadDependencies(): any;
    connect(): Promise<void>;
    afterConnect(): Promise<void>;
    disconnect(): Promise<void>;
    createSchemaBuilder(): SchemaBuilder;
    createQueryRunner(mode: ReplicationMode): DynamoQueryRunner;
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    escapeQueryWithParameters(sql: string, parameters: ObjectLiteral, nativeParameters: ObjectLiteral): [string, any[]];
    escape(name: string): string;
    buildTableName(tableName: string, schema?: string, database?: string): string;
    /**
     * Parse a target table name or other types and return a normalized table definition.
     */
    parseTableName(target: EntityMetadata | Table | View | TableForeignKey | string): {
        tableName: string;
        schema?: string;
        database?: string;
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    preparePersistentValue(value: any, columnMetadata: ColumnMetadata): any;
    /**
     * Prepares given value to a value to be persisted, based on its column type or metadata.
     */
    prepareHydratedValue(value: any, columnMetadata: ColumnMetadata): any;
    normalizeDynamodbType(column: {
        type?: string | BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor | undefined;
        length?: string | number | undefined;
        precision?: number | null | undefined;
        scale?: number | undefined;
        isArray?: boolean | undefined;
    }): string;
    normalizeType(column: {
        type?: string | BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor | undefined;
        length?: string | number | undefined;
        precision?: number | null | undefined;
        scale?: number | undefined;
        isArray?: boolean | undefined;
    }): string;
    /**
     * Normalizes "default" value of the column.
     */
    normalizeDefault(columnMetadata: ColumnMetadata): string | undefined;
    /**
     * Normalizes "isUnique" value of the column.
     */
    normalizeIsUnique(column: ColumnMetadata): boolean;
    /**
     * Calculates column length taking into account the default length values.
     */
    getColumnLength(column: ColumnMetadata): string;
    /**
     * Normalizes "default" value of the column.
     */
    createFullType(column: TableColumn): string;
    /**
     * Obtains a new database connection to a master server.
     * Used for replication.
     * If replication is not setup then returns default connection's database connection.
     */
    obtainMasterConnection(): Promise<any>;
    /**
     * Obtains a new database connection to a slave server.
     * Used for replication.
     * If replication is not setup then returns master (default) connection's database connection.
     */
    obtainSlaveConnection(): Promise<any>;
    /**
     * Creates generated map of values generated or returned by database after INSERT query.
     */
    createGeneratedMap(metadata: EntityMetadata, insertedId: any): any;
    /**
     * Differentiate columns of this table and columns from the given column metadatas columns
     * and returns only changed.
     */
    findChangedColumns(tableColumns: TableColumn[], columnMetadatas: ColumnMetadata[]): ColumnMetadata[];
    isReturningSqlSupported(): boolean;
    isUUIDGenerationSupported(): boolean;
    isFullTextColumnTypeSupported(): boolean;
    createParameter(parameterName: string, index: number): string;
}
