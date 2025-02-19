/// <reference types="node" />
import { View } from 'typeorm/schema-builder/view/View';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { SqlInMemory } from 'typeorm/driver/SqlInMemory';
import { Broadcaster } from 'typeorm/subscriber/Broadcaster';
import { QueryRunner, ObjectLiteral, TableColumn, Table, TableForeignKey, TableIndex, TableUnique, ReplicationMode, TableExclusion, TableCheck } from 'typeorm';
import { DynamoEntityManager } from './entity-manager/DynamoEntityManager';
import { DataSource } from 'typeorm/data-source';
declare class DeleteManyOptions {
    maxConcurrency: number;
}
declare class PutManyOptions {
    maxConcurrency: number;
}
export declare class DynamoQueryRunner implements QueryRunner {
    /**
     * Connection used by this query runner.
     */
    connection: DataSource;
    /**
     * Entity manager working only with current query runner.
     */
    manager: DynamoEntityManager;
    /**
     * DynamoDB does not require to dynamically create query runner each time,
     * because it does not have a regular connection pool as RDBMS systems have.
     */
    queryRunner?: DynamoQueryRunner;
    /**
     * Indicates if connection for this query runner is released.
     * Once its released, query runner cannot run queries anymore.
     * Always false for DynamoDB since DynamoDB has a single query executor instance.
     */
    isReleased: boolean;
    /**
     * Indicates if transaction is active in this query executor.
     * Always false for DynamoDB since DynamoDB does not support transactions.
     */
    isTransactionActive: boolean;
    /**
     * Stores temporarily user data.
     * Useful for sharing data with subscribers.
     */
    data: {};
    /**
     * All synchronized tables in the database.
     */
    loadedTables: Table[];
    /**
     * All synchronized views in the database.
     */
    loadedViews: any[];
    /**
     * Real database connection from a connection pool used to perform queries.
     */
    databaseConnection: undefined;
    constructor(connection: DataSource, databaseConnection: any);
    /**
     * Broadcaster used on this query runner to broadcast entity events.
     */
    broadcaster: Broadcaster;
    clearDatabase(database?: string): Promise<void>;
    stream(query: string, parameters?: any[], onEnd?: Function, onError?: Function): Promise<ReadStream>;
    getView(viewPath: string): Promise<View | undefined>;
    getViews(viewPaths?: string[]): Promise<View[]>;
    /**
     * Delete multiple documents on DynamoDB.
     */
    deleteMany(tableName: string, keys: ObjectLiteral[], options?: DeleteManyOptions): Promise<void>;
    /**
     * Delete a document on DynamoDB.
     */
    deleteOne(tableName: string, key: ObjectLiteral): Promise<void>;
    /**
     * Inserts an array of documents into DynamoDB.
     */
    putMany(tableName: string, docs: ObjectLiteral[], options?: PutManyOptions): Promise<void>;
    /**
     * Inserts a single document into DynamoDB.
     */
    putOne(tableName: string, doc: ObjectLiteral): Promise<ObjectLiteral>;
    /**
     * For DynamoDB database we don't create connection, because its single connection already created by a driver.
     */
    connect(): Promise<any>;
    /**
     * For DynamoDB database we don't release connection, because its single connection.
     */
    release(): Promise<void>;
    /**
     * Starts transaction.
     */
    startTransaction(): Promise<void>;
    /**
     * Commits transaction.
     */
    commitTransaction(): Promise<void>;
    /**
     * Rollbacks transaction.
     */
    rollbackTransaction(): Promise<void>;
    /**
     * Executes a given SQL query.
     */
    query(query: string, parameters?: any[]): Promise<any>;
    /**
     * Returns raw data stream.
     */
    /**
     * Returns all available database names including system databases.
     */
    getDatabases(): Promise<string[]>;
    /**
     * Returns all available schema names including system schemas.
     * If database parameter specified, returns schemas of that database.
     */
    getSchemas(database?: string): Promise<string[]>;
    /**
     * Loads given table's data from the database.
     */
    getTable(collectionName: string): Promise<Table | undefined>;
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    getTables(collectionNames: string[]): Promise<Table[]>;
    /**
     * Checks if database with the given name exist.
     */
    hasDatabase(database: string): Promise<boolean>;
    /**
     * Loads currently using database
     */
    getCurrentDatabase(): Promise<undefined>;
    /**
     * Checks if schema with the given name exist.
     */
    hasSchema(schema: string): Promise<boolean>;
    /**
     * Loads currently using database schema
     */
    getCurrentSchema(): Promise<undefined>;
    /**
     * Checks if table with the given name exist in the database.
     */
    hasTable(collectionName: string): Promise<boolean>;
    /**
     * Checks if column with the given name exist in the given table.
     */
    hasColumn(tableOrName: Table | string, columnName: string): Promise<boolean>;
    /**
     * Creates a database if it's not created.
     */
    createDatabase(database: string): Promise<void>;
    /**
     * Drops database.
     */
    dropDatabase(database: string, ifExist?: boolean): Promise<void>;
    /**
     * Creates a new table schema.
     */
    createSchema(schemaPath: string, ifNotExist?: boolean): Promise<void>;
    /**
     * Drops table schema.
     */
    dropSchema(schemaPath: string, ifExist?: boolean): Promise<void>;
    /**
     * Creates a new table from the given table and columns inside it.
     */
    createTable(table: Table): Promise<void>;
    /**
     * Drops the table.
     */
    dropTable(tableName: Table | string): Promise<void>;
    /**
     * Creates a new view.
     */
    createView(view: View): Promise<void>;
    /**
     * Drops the view.
     */
    dropView(target: View | string): Promise<void>;
    /**
     * Renames the given table.
     */
    renameTable(oldTableOrName: Table | string, newTableOrName: Table | string): Promise<void>;
    /**
     * Renames the given table.
     */
    changeTableComment(tableOrName: Table | string, comment?: string): Promise<void>;
    /**
     * Creates a new column from the column in the table.
     */
    addColumn(tableOrName: Table | string, column: TableColumn): Promise<void>;
    /**
     * Creates a new columns from the column in the table.
     */
    addColumns(tableOrName: Table | string, columns: TableColumn[]): Promise<void>;
    /**
     * Renames column in the given table.
     */
    renameColumn(tableOrName: Table | string, oldTableColumnOrName: TableColumn | string, newTableColumnOrName: TableColumn | string): Promise<void>;
    /**
     * Changes a column in the table.
     */
    changeColumn(tableOrName: Table | string, oldTableColumnOrName: TableColumn | string, newColumn: TableColumn): Promise<void>;
    /**
     * Changes a column in the table.
     */
    changeColumns(tableOrName: Table | string, changedColumns: {
        newColumn: TableColumn;
        oldColumn: TableColumn;
    }[]): Promise<void>;
    /**
     * Drops column in the table.
     */
    dropColumn(tableOrName: Table | string, columnOrName: TableColumn | string): Promise<void>;
    /**
     * Drops the columns in the table.
     */
    dropColumns(tableOrName: Table | string, columns: TableColumn[] | string[]): Promise<void>;
    /**
     * Creates a new primary key.
     */
    createPrimaryKey(tableOrName: Table | string, columnNames: string[]): Promise<void>;
    /**
     * Updates composite primary keys.
     */
    updatePrimaryKeys(tableOrName: Table | string, columns: TableColumn[]): Promise<void>;
    /**
     * Drops a primary key.
     */
    dropPrimaryKey(tableOrName: Table | string): Promise<void>;
    /**
     * Creates a new unique constraint.
     */
    createUniqueConstraint(tableOrName: Table | string, uniqueConstraint: TableUnique): Promise<void>;
    /**
     * Creates a new unique constraints.
     */
    createUniqueConstraints(tableOrName: Table | string, uniqueConstraints: TableUnique[]): Promise<void>;
    /**
     * Drops an unique constraint.
     */
    dropUniqueConstraint(tableOrName: Table | string, uniqueOrName: TableUnique | string): Promise<void>;
    /**
     * Drops an unique constraints.
     */
    dropUniqueConstraints(tableOrName: Table | string, uniqueConstraints: TableUnique[]): Promise<void>;
    /**
     * Creates a new check constraint.
     */
    createCheckConstraint(tableOrName: Table | string, checkConstraint: TableCheck): Promise<void>;
    /**
     * Creates a new check constraints.
     */
    createCheckConstraints(tableOrName: Table | string, checkConstraints: TableCheck[]): Promise<void>;
    /**
     * Drops check constraint.
     */
    dropCheckConstraint(tableOrName: Table | string, checkOrName: TableCheck | string): Promise<void>;
    /**
     * Drops check constraints.
     */
    dropCheckConstraints(tableOrName: Table | string, checkConstraints: TableCheck[]): Promise<void>;
    /**
     * Creates a new exclusion constraint.
     */
    createExclusionConstraint(tableOrName: Table | string, exclusionConstraint: TableExclusion): Promise<void>;
    /**
     * Creates a new exclusion constraints.
     */
    createExclusionConstraints(tableOrName: Table | string, exclusionConstraints: TableExclusion[]): Promise<void>;
    /**
     * Drops exclusion constraint.
     */
    dropExclusionConstraint(tableOrName: Table | string, exclusionOrName: TableExclusion | string): Promise<void>;
    /**
     * Drops exclusion constraints.
     */
    dropExclusionConstraints(tableOrName: Table | string, exclusionConstraints: TableExclusion[]): Promise<void>;
    /**
     * Creates a new foreign key.
     */
    createForeignKey(tableOrName: Table | string, foreignKey: TableForeignKey): Promise<void>;
    /**
     * Creates a new foreign keys.
     */
    createForeignKeys(tableOrName: Table | string, foreignKeys: TableForeignKey[]): Promise<void>;
    /**
     * Drops a foreign key from the table.
     */
    dropForeignKey(tableOrName: Table | string, foreignKey: TableForeignKey): Promise<void>;
    /**
     * Drops a foreign keys from the table.
     */
    dropForeignKeys(tableOrName: Table | string, foreignKeys: TableForeignKey[]): Promise<void>;
    /**
     * Creates a new index.
     */
    createIndex(tableOrName: Table | string, index: TableIndex): Promise<void>;
    /**
     * Creates a new indices
     */
    createIndices(tableOrName: Table | string, indices: TableIndex[]): Promise<void>;
    /**
     * Drops an index from the table.
     */
    dropIndex(collectionName: string, indexName: string): Promise<void>;
    /**
     * Drops an indices from the table.
     */
    dropIndices(tableOrName: Table | string, indices: TableIndex[]): Promise<void>;
    /**
     * Drops collection.
     */
    clearTable(tableName: string): Promise<void>;
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    enableSqlMemory(): void;
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    disableSqlMemory(): void;
    /**
     * Flushes all memorized sqls.
     */
    clearSqlMemory(): void;
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    getMemorySql(): SqlInMemory;
    /**
     * Executes up sql queries.
     */
    executeMemoryUpSql(): Promise<void>;
    /**
     * Executes down sql queries.
     */
    executeMemoryDownSql(): Promise<void>;
    getReplicationMode(): ReplicationMode;
    /**
     * Called before migrations are run.
     */
    beforeMigration(): Promise<void>;
    /**
     * Called after migrations are run.
     */
    afterMigration(): Promise<void>;
}
export {};
