"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindOptions = exports.BeginsWith = void 0;
const DynamoAttributeHelper_1 = require("../helpers/DynamoAttributeHelper");
const DynamoTextHelper_1 = require("../helpers/DynamoTextHelper");
const DynamoObjectHelper_1 = require("../helpers/DynamoObjectHelper");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const typeorm_1 = require("typeorm");
const property_parser_1 = require("../parsers/property-parser");
const keyword_helper_1 = require("../helpers/keyword-helper");
const common_utils_1 = require("../utils/common-utils");
const BeginsWith = (value) => new typeorm_1.FindOperator('beginsWith', value);
exports.BeginsWith = BeginsWith;
const operators = {
    and: (property, value, operator) => operator.value.map((operator, i) => operators[operator.type](property, `${value}${i}`, operator)).join(' and '),
    lessThan: (property, value) => `${property} < ${value}`,
    lessThanOrEqual: (property, value) => `${property} <= ${value}`,
    moreThan: (property, value) => `${property} > ${value}`,
    moreThanOrEqual: (property, value) => `${property} >= ${value}`,
    equal: (property, value) => `${property} = ${value}`,
    between: (property, value) => `${property} BETWEEN ${value[0]} AND ${value[1]}`,
    beginsWith: (property, value) => `begins_with(${property}, ${value})`
};
const removeLeadingAndTrailingQuotes = (text) => {
    return text.replace(/(^['"]|['"]$)/g, '');
};
const containsToFilterExpression = (expression) => {
    if (expression && expression.toLowerCase().includes('contains(')) {
        const haystack = expression.replace(/^contains\(/gi, '').replace(/\)$/, '');
        const parts = haystack.split(',');
        if (parts.length === 2) {
            const name = parts[0].trim();
            const value = parts[1].trim();
            const re = new RegExp(`${name}(?=(?:(?:[^']*'){2})*[^']*$)`);
            let newExpression = haystack.replace(re, `#${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`);
            newExpression = newExpression.replace(value, `:${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`);
            return `contains(${newExpression})`;
        }
        else {
            throw Error(`Failed to parse contains to ExpressionAttributeNames: ${expression}`);
        }
    }
    return expression;
};
const containsToAttributeValues = (expression, values) => {
    if (expression && expression.toLowerCase().includes('contains(')) {
        const haystack = expression.replace(/^contains\(/gi, '').replace(/\)$/, '');
        const parts = haystack.split(',');
        if (parts.length === 2) {
            const name = parts[0].trim();
            const value = parts[1].trim().replace(/'/g, '');
            values[`:${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`] = (0, util_dynamodb_1.marshall)(removeLeadingAndTrailingQuotes(value));
        }
        else {
            throw Error(`Failed to parse contains to ExpressionAttributeNames: ${expression}`);
        }
    }
    return expression;
};
class FindOptions {
    static toAttributeNames(findOptions) {
        return DynamoAttributeHelper_1.dynamoAttributeHelper.toAttributeNames(findOptions.where, findOptions.filter, findOptions.select);
    }
    static toKeyConditionExpression(findOptions) {
        if ((0, DynamoObjectHelper_1.isNotEmpty)(findOptions.where)) {
            const keys = Object.keys(findOptions.where);
            const values = [];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const attribute = (0, DynamoTextHelper_1.poundToUnderscore)(key);
                if (findOptions.where[key] instanceof typeorm_1.FindOperator) {
                    if (operators[findOptions.where[key].type]) {
                        values.push(operators[findOptions.where[key].type](`#${attribute}`, `:${attribute}`, findOptions.where[key]));
                    }
                    else {
                        throw new Error(`Operator "${findOptions.where[key].type}" not supported`);
                    }
                }
                else {
                    values.push(`#${attribute} = :${attribute}`);
                }
            }
            return values.join(' and ');
        }
        return undefined;
    }
    static toExpressionAttributeValues(findOptions) {
        const values = {};
        if ((0, DynamoObjectHelper_1.isNotEmpty)(findOptions.where)) {
            const keys = Object.keys(findOptions.where);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (findOptions.where[key] instanceof typeorm_1.FindOperator) {
                    if (findOptions.where[key].type === 'and') {
                        findOptions.where[key].value.forEach((operator, i) => {
                            values[`:${(0, DynamoTextHelper_1.poundToUnderscore)(key)}${i}`] =
                                (0, util_dynamodb_1.marshall)(operator.value);
                        });
                    }
                    else {
                        values[`:${(0, DynamoTextHelper_1.poundToUnderscore)(key)}`] =
                            (0, util_dynamodb_1.marshall)(findOptions.where[key].value);
                    }
                }
                else {
                    values[`:${(0, DynamoTextHelper_1.poundToUnderscore)(key)}`] =
                        (0, util_dynamodb_1.marshall)(findOptions.where[key]);
                }
            }
        }
        if (findOptions.filter) {
            const expressions = findOptions.filter.split(/ and | or /gi).map(expression => expression.trim());
            expressions.forEach(expression => {
                expression = containsToAttributeValues(expression, values);
                if (!expression.toLowerCase().includes('contains(')) {
                    const parts = (0, property_parser_1.splitOperators)(expression);
                    if (parts.length === 2) {
                        const name = parts[0].trim();
                        const value = parts[1].trim();
                        values[`:${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`] = (0, util_dynamodb_1.marshall)(removeLeadingAndTrailingQuotes(value));
                    }
                    else {
                        throw Error(`Failed to convert filter to ExpressionAttributeValues: ${findOptions.filter}`);
                    }
                }
            });
        }
        return common_utils_1.commonUtils.isNotEmpty(values) ? values : undefined;
    }
    static toFilterExpression(options) {
        if (options.filter) {
            const expressions = options.filter.split(/ and | or /gi); // Split by AND/OR
            const connectors = options.filter.match(/ and | or /gi) || []; // Extract AND/OR operators
            const processedExpressions = expressions.map(expression => {
                let processedExpression = containsToFilterExpression(expression.trim());
                if (!expression.toLowerCase().includes('contains(')) {
                    const parts = (0, property_parser_1.splitOperators)(expression.trim());
                    if (parts.length === 2) {
                        const name = parts[0].trim();
                        const value = parts[1].trim();
                        if (value.startsWith("'")) {
                            const re = new RegExp(`${name}(?=(?:(?:[^']*'){2})*[^']*$)`);
                            processedExpression = processedExpression.replace(re, `#${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`);
                        }
                        else if (value.startsWith('"')) {
                            const re = new RegExp(`${name}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
                            processedExpression = processedExpression.replace(re, `#${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`);
                        }
                        processedExpression = processedExpression.replace(value, `:${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`);
                        processedExpression = processedExpression.replace(/['"]/g, '');
                    }
                    else {
                        throw Error(`Failed to convert filter to ExpressionAttributeValues: ${options.filter}`);
                    }
                }
                return processedExpression;
            });
            // Combine processed expressions
            let finalFilterExpression = processedExpressions[0];
            for (let i = 1; i < processedExpressions.length; i++) {
                finalFilterExpression += ` ${connectors[i - 1].trim()} ${processedExpressions[i]}`;
            }
            return finalFilterExpression;
        }
        return undefined;
    }
    static toProjectionExpression(options) {
        if (options.select) {
            const names = options.select.split(',');
            const safeNames = [];
            names.forEach((name) => {
                const trimmedName = name.trim();
                if ((0, keyword_helper_1.isReservedKeyword)(trimmedName)) {
                    safeNames.push(`#${trimmedName}`);
                }
                else {
                    safeNames.push(trimmedName);
                }
            });
            return safeNames.join(',');
        }
        return undefined;
    }
}
exports.FindOptions = FindOptions;
