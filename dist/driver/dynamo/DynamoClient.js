"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentClient = exports.DynamoClient = void 0;
const PlatformTools_1 = require("typeorm/platform/PlatformTools");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const node_http_handler_1 = require("@smithy/node-http-handler");
const environment_utils_1 = require("./utils/environment-utils");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const region_helper_1 = require("./helpers/region-helper");
let dynamoDBDocumentClient;
class DynamoClient {
    getClient(config = {}) {
        if (!dynamoDBDocumentClient) {
            const ClientDynamoDb = PlatformTools_1.PlatformTools.load('@aws-sdk/client-dynamodb');
            const LibDynamoDb = PlatformTools_1.PlatformTools.load('@aws-sdk/lib-dynamodb');
            const client = new ClientDynamoDb.DynamoDBClient(Object.assign({ region: (0, region_helper_1.getRegion)(), endpoint: environment_utils_1.environmentUtils.getVariable('DYNAMO_ENDPOINT'), requestHandler: new node_http_handler_1.NodeHttpHandler({
                    requestTimeout: 10000 // <- this decreases the emfiles count, the Node.js default is 120000
                }) }, config));
            dynamoDBDocumentClient = LibDynamoDb.DynamoDBDocumentClient.from(client, {
                marshallOptions: {
                    convertClassInstanceToMap: true,
                    removeUndefinedValues: true
                }
            });
        }
        return dynamoDBDocumentClient;
    }
    put(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb put', params);
        }
        return this.getClient().send(new lib_dynamodb_1.PutCommand(params));
    }
    update(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb update', params);
        }
        return this.getClient().send(new lib_dynamodb_1.UpdateCommand(params));
    }
    scan(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb scan', params);
        }
        return this.getClient().send(new client_dynamodb_1.ScanCommand(params));
    }
    query(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb query', params);
        }
        return this.getClient().send(new client_dynamodb_1.QueryCommand(params));
    }
    delete(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb delete', params);
        }
        return this.getClient().send(new lib_dynamodb_1.DeleteCommand(params));
    }
    batchGet(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb batchGet', params);
        }
        return this.getClient().send(new lib_dynamodb_1.BatchGetCommand(params));
    }
    batchWrite(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb batchWrite', params);
        }
        return this.getClient().send(new lib_dynamodb_1.BatchWriteCommand(params));
    }
    executeStatement(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb executeStatement', params);
        }
        return this.getClient().send(new lib_dynamodb_1.ExecuteStatementCommand(params));
    }
    deleteTable(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb delete table', params);
        }
        return this.getClient().send(new client_dynamodb_1.DeleteTableCommand(params));
    }
    describeTable(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb describe table', params);
        }
        return this.getClient().send(new client_dynamodb_1.DescribeTableCommand(params));
    }
    listTables(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb list tables', params);
        }
        return this.getClient().send(new client_dynamodb_1.ListTablesCommand(params));
    }
    createTable(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb create table', params);
        }
        return this.getClient().send(new client_dynamodb_1.CreateTableCommand(params));
    }
    updateTable(params) {
        if (environment_utils_1.environmentUtils.isTrue('DEBUG_DYNAMODB')) {
            console.log('dynamodb create table', params);
        }
        return this.getClient().send(new client_dynamodb_1.UpdateTableCommand(params));
    }
}
exports.DynamoClient = DynamoClient;
const getDocumentClient = () => {
    return new DynamoClient();
};
exports.getDocumentClient = getDocumentClient;
