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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.getRepository = exports.getCustomRepository = exports.getConnection = exports.open = exports.datasourceManager = exports.DatasourceManagerOptions = void 0;
const typeorm_1 = require("typeorm");
const common_utils_1 = require("../utils/common-utils");
const DriverFactory_1 = require("typeorm/driver/DriverFactory");
const EntityManagerFactory_1 = require("typeorm/entity-manager/EntityManagerFactory");
const DynamoEntityManager_1 = require("../entity-manager/DynamoEntityManager");
const PlatformTools_1 = require("typeorm/platform/PlatformTools");
const path_1 = __importDefault(require("path"));
const SqljsEntityManager_1 = require("typeorm/entity-manager/SqljsEntityManager");
const MysqlDriver_1 = require("typeorm/driver/mysql/MysqlDriver");
const PostgresDriver_1 = require("typeorm/driver/postgres/PostgresDriver");
const CockroachDriver_1 = require("typeorm/driver/cockroachdb/CockroachDriver");
const SapDriver_1 = require("typeorm/driver/sap/SapDriver");
const SqliteDriver_1 = require("typeorm/driver/sqlite/SqliteDriver");
const BetterSqlite3Driver_1 = require("typeorm/driver/better-sqlite3/BetterSqlite3Driver");
const CordovaDriver_1 = require("typeorm/driver/cordova/CordovaDriver");
const NativescriptDriver_1 = require("typeorm/driver/nativescript/NativescriptDriver");
const ReactNativeDriver_1 = require("typeorm/driver/react-native/ReactNativeDriver");
const SqljsDriver_1 = require("typeorm/driver/sqljs/SqljsDriver");
const OracleDriver_1 = require("typeorm/driver/oracle/OracleDriver");
const SqlServerDriver_1 = require("typeorm/driver/sqlserver/SqlServerDriver");
const MongoDriver_1 = require("typeorm/driver/mongodb/MongoDriver");
const DynamoDriver_1 = require("../DynamoDriver");
const ExpoDriver_1 = require("typeorm/driver/expo/ExpoDriver");
const AuroraMysqlDriver_1 = require("typeorm/driver/aurora-mysql/AuroraMysqlDriver");
const AuroraPostgresDriver_1 = require("typeorm/driver/aurora-postgres/AuroraPostgresDriver");
const CapacitorDriver_1 = require("typeorm/driver/capacitor/CapacitorDriver");
const SpannerDriver_1 = require("typeorm/driver/spanner/SpannerDriver");
const DynamoClient_1 = require("../DynamoClient");
let connection = null;
let entityManager = null;
DriverFactory_1.DriverFactory.prototype.create = (connection) => {
    const { type } = connection.options;
    switch (type) {
        case 'mysql':
            return new MysqlDriver_1.MysqlDriver(connection);
        case 'postgres':
            return new PostgresDriver_1.PostgresDriver(connection);
        case 'cockroachdb':
            return new CockroachDriver_1.CockroachDriver(connection);
        case 'sap':
            return new SapDriver_1.SapDriver(connection);
        case 'mariadb':
            return new MysqlDriver_1.MysqlDriver(connection);
        case 'sqlite':
            return new SqliteDriver_1.SqliteDriver(connection);
        case 'better-sqlite3':
            return new BetterSqlite3Driver_1.BetterSqlite3Driver(connection);
        case 'cordova':
            return new CordovaDriver_1.CordovaDriver(connection);
        case 'nativescript':
            return new NativescriptDriver_1.NativescriptDriver(connection);
        case 'react-native':
            return new ReactNativeDriver_1.ReactNativeDriver(connection);
        case 'sqljs':
            return new SqljsDriver_1.SqljsDriver(connection);
        case 'oracle':
            return new OracleDriver_1.OracleDriver(connection);
        case 'mssql':
            return new SqlServerDriver_1.SqlServerDriver(connection);
        case 'mongodb':
            return new MongoDriver_1.MongoDriver(connection);
        case 'dynamodb':
            return new DynamoDriver_1.DynamoDriver(connection);
        case 'expo':
            return new ExpoDriver_1.ExpoDriver(connection);
        case 'aurora-mysql':
            return new AuroraMysqlDriver_1.AuroraMysqlDriver(connection);
        case 'aurora-postgres':
            return new AuroraPostgresDriver_1.AuroraPostgresDriver(connection);
        case 'capacitor':
            return new CapacitorDriver_1.CapacitorDriver(connection);
        case 'spanner':
            return new SpannerDriver_1.SpannerDriver(connection);
        default:
            throw new typeorm_1.MissingDriverError(type, [
                'aurora-mysql',
                'aurora-postgres',
                'better-sqlite3',
                'capacitor',
                'cockroachdb',
                'cordova',
                'expo',
                'mariadb',
                'mongodb',
                'dynamodb',
                'mssql',
                'mysql',
                'nativescript',
                'oracle',
                'postgres',
                'react-native',
                'sap',
                'sqlite',
                'sqljs',
                'spanner'
            ]);
    }
};
EntityManagerFactory_1.EntityManagerFactory.prototype.create = (connection, queryRunner) => {
    const type = connection.driver.options.type;
    if (type === 'dynamodb') {
        entityManager = new DynamoEntityManager_1.DynamoEntityManager(connection);
    }
    else if (type === 'mongodb') {
        entityManager = new typeorm_1.MongoEntityManager(connection);
    }
    else if (type === 'sqljs') {
        entityManager = new SqljsEntityManager_1.SqljsEntityManager(connection, queryRunner);
    }
    else {
        entityManager = new typeorm_1.EntityManager(connection, queryRunner);
    }
    return entityManager;
};
PlatformTools_1.PlatformTools.load = function (name) {
    // if name is not absolute or relative, then try to load package from the node_modules of the directory we are currently in
    // this is useful when we are using typeorm package globally installed and it accesses drivers
    // that are not installed globally
    try {
        // switch case to explicit require statements for webpack compatibility.
        switch (name) {
            /**
                 * aws-sdk
                 */
            case '@aws-sdk/client-dynamodb':
                return require('@aws-sdk/client-dynamodb');
            case '@aws-sdk/lib-dynamodb':
                return require('@aws-sdk/lib-dynamodb');
            /**
             * mongodb
             */
            case 'mongodb':
                return require('mongodb');
            /**
             * hana
             */
            case '@sap/hana-client':
                return require('@sap/hana-client');
            case 'hdb-pool':
                return require('hdb-pool');
            /**
             * mysql
             */
            case 'mysql':
                return require('mysql');
            case 'mysql2':
                return require('mysql2');
            /**
             * oracle
             */
            case 'oracledb':
                return require('oracledb');
            /**
             * postgres
             */
            case 'pg':
                return require('pg');
            case 'pg-native':
                return require('pg-native');
            case 'pg-query-stream':
                return require('pg-query-stream');
            case 'typeorm-aurora-data-api-driver':
                return require('typeorm-aurora-data-api-driver');
            /**
             * redis
             */
            case 'redis':
                return require('redis');
            case 'ioredis':
                return require('ioredis');
            /**
             * better-sqlite3
             */
            case 'better-sqlite3':
                return require('better-sqlite3');
            /**
             * sqlite
             */
            case 'sqlite3':
                return require('sqlite3');
            /**
             * sql.js
             */
            case 'sql.js':
                return require('sql.js');
            /**
             * sqlserver
             */
            case 'mssql':
                return require('mssql');
            /**
             * react-native-sqlite
             */
            case 'react-native-sqlite-storage':
                return require('react-native-sqlite-storage');
        }
    }
    catch (err) {
        return require(path_1.default.resolve(process.cwd() + '/node_modules/' + name));
    }
    // If nothing above matched and we get here, the package was not listed within PlatformTools
    // and is an Invalid Package.  To make it explicit that this is NOT the intended use case for
    // PlatformTools.load - it's not just a way to replace `require` all willy-nilly - let's throw
    // an error.
    throw new TypeError('Invalid Package for PlatformTools.load: ' + name);
};
class DatasourceManagerOptions {
}
exports.DatasourceManagerOptions = DatasourceManagerOptions;
const DEFAULT_OPTIONS = {
    entities: ['**/entities/**/*.{js,ts}'],
    synchronize: false
};
exports.datasourceManager = {
    open(options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = common_utils_1.commonUtils.mixin(Object.assign({}, DEFAULT_OPTIONS), options);
            if (!connection) {
                const connectionOptions = {
                    type: 'dynamodb',
                    entities: options === null || options === void 0 ? void 0 : options.entities
                };
                connection = yield new typeorm_1.DataSource(connectionOptions).initialize();
            }
            if (options.clientConfig) {
                new DynamoClient_1.DynamoClient().getClient(options.clientConfig);
            }
            if (options.synchronize) {
                console.log('synchronizing database ... ');
                yield connection.synchronize();
            }
            return connection;
        });
    },
    getConnection(name) {
        // maintaining a list of connections was deprecated by typeorm
        // we could maintain a map of all the names in the future
        // to recreate the original typeorm logic
        if (!connection) {
            throw new Error('connection is undefined.  Did you forget to call open()?');
        }
        return connection;
    },
    getCustomRepository(customRepository, customEntity, name) {
        return new customRepository(customEntity, connection.createEntityManager());
    },
    getRepository(target, name) {
        return exports.datasourceManager.getConnection(name).getRepository(target);
    },
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            // does nothing in dynamodb.  Adding for compatability with other libraries.
        });
    }
};
const open = (options) => __awaiter(void 0, void 0, void 0, function* () {
    return exports.datasourceManager.open(options);
});
exports.open = open;
const getConnection = (name) => {
    return exports.datasourceManager.getConnection(name);
};
exports.getConnection = getConnection;
const getCustomRepository = (customRepository, customEntity, name) => {
    return exports.datasourceManager.getCustomRepository(customRepository, customEntity);
};
exports.getCustomRepository = getCustomRepository;
const getRepository = (target, name) => {
    return exports.datasourceManager.getRepository(target, name);
};
exports.getRepository = getRepository;
const close = () => {
    return exports.datasourceManager.close();
};
exports.close = close;
