"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramHelper = void 0;
const UpdateExpressionOptions_1 = require("../models/UpdateExpressionOptions");
const FindOptions_1 = require("../models/FindOptions");
const DynamoGlobalSecondaryIndexHelper_1 = require("./DynamoGlobalSecondaryIndexHelper");
const DynamoObjectHelper_1 = require("./DynamoObjectHelper");
const hasSortValue = (sortValues) => {
    if (sortValues && sortValues.length > 0) {
        for (const sortValue of sortValues) {
            if (sortValue !== '') {
                return true;
            }
        }
    }
};
const indexedWhere = (options, indices) => {
    indices = indices || [];
    const index = indices.find((index) => {
        return index.name === options.index;
    });
    const where = {};
    if (index && options.where) {
        const columns = index.columns || [];
        const partitionKey = (0, DynamoGlobalSecondaryIndexHelper_1.buildPartitionKey)(columns);
        const values = [];
        for (let i = 0; i < columns.length; i += 1) {
            const column = columns[i];
            const value = options.where[column.propertyName];
            values.push(value);
        }
        where[partitionKey] = values.length > 1 ? values.join('#') : values[0];
        if (index.where) {
            const sortColumns = index.where.split('#');
            const sortValues = [];
            for (let i = 0; i < sortColumns.length; i += 1) {
                const sortValue = options.where[sortColumns[i]];
                if (sortValue) {
                    sortValues.push(options.where[sortColumns[i]]);
                }
                else {
                    sortValues.push('');
                }
            }
            if (hasSortValue(sortValues)) {
                where[index.where] = sortValues.length > 1 ? sortValues.join('#') : sortValues[0];
            }
        }
    }
    return (0, DynamoObjectHelper_1.isNotEmpty)(where) ? where : options.where;
};
exports.paramHelper = {
    find(tableName, options, indices) {
        options.where = indexedWhere(options, indices);
        const params = {
            TableName: tableName,
            KeyConditionExpression: FindOptions_1.FindOptions.toKeyConditionExpression(options),
            ExpressionAttributeNames: FindOptions_1.FindOptions.toAttributeNames(options),
            ExpressionAttributeValues: FindOptions_1.FindOptions.toExpressionAttributeValues(options),
            FilterExpression: FindOptions_1.FindOptions.toFilterExpression(options),
            ProjectionExpression: FindOptions_1.FindOptions.toProjectionExpression(options),
            ScanIndexForward: options.sort !== 'DESC'
        };
        if (options.index) {
            params.IndexName = options.index;
        }
        if (options.limit) {
            params.Limit = options.limit;
        }
        if (options.exclusiveStartKey) {
            params.ExclusiveStartKey = options.exclusiveStartKey;
        }
        return params;
    },
    update(tableName, options) {
        return {
            TableName: tableName,
            Key: options.where,
            UpdateExpression: UpdateExpressionOptions_1.UpdateExpressionOptions.toUpdateExpression(options),
            ExpressionAttributeNames: UpdateExpressionOptions_1.UpdateExpressionOptions.toAttributeNames(options),
            ExpressionAttributeValues: UpdateExpressionOptions_1.UpdateExpressionOptions.toExpressionAttributeValues(options)
        };
    }
};
