"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoAttributeHelper = void 0;
const DynamoTextHelper_1 = require("./DynamoTextHelper");
const DynamoObjectHelper_1 = require("./DynamoObjectHelper");
const property_parser_1 = require("../parsers/property-parser");
const keyword_helper_1 = require("./keyword-helper");
const containsToAttributeNames = (expression, attributeNames) => {
    if (expression && expression.toLowerCase().includes('contains(')) {
        const haystack = expression.replace(/^contains\(/gi, '').replace(/\)$/, '');
        const parts = haystack.split(',');
        if (parts.length === 2) {
            const name = parts[0].trim();
            attributeNames[`#${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`] = name;
        }
        else {
            throw Error(`Failed to parse contains to ExpressionAttributeNames: ${expression}`);
        }
    }
    return expression;
};
exports.dynamoAttributeHelper = {
    toAttributeNames(object, filter, select, attributeNames) {
        if ((0, DynamoObjectHelper_1.isNotEmpty)(object)) {
            attributeNames = attributeNames || {};
            const keys = Object.keys(object);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                attributeNames[`#${(0, DynamoTextHelper_1.poundToUnderscore)(key)}`] = key;
            }
        }
        if (filter) {
            attributeNames = attributeNames || {};
            const expressions = filter.split(/ and | or /gi).map((expression) => expression.trim());
            expressions.forEach((expression) => {
                expression = containsToAttributeNames(expression, attributeNames);
                if (!expression.toLowerCase().includes('contains(')) {
                    const parts = (0, property_parser_1.splitOperators)(expression);
                    if (parts.length === 2) {
                        const name = parts[0].trim();
                        attributeNames[`#${(0, DynamoTextHelper_1.poundToUnderscore)(name)}`] = name;
                    }
                    else {
                        throw Error(`Failed to convert filter to ExpressionAttributeNames: ${filter}`);
                    }
                }
            });
        }
        if (select) {
            const names = select.split(',');
            names.forEach((name) => {
                const trimmedName = name.trim();
                if ((0, keyword_helper_1.isReservedKeyword)(trimmedName)) {
                    attributeNames[`#${trimmedName}`] = trimmedName;
                }
            });
        }
        return attributeNames;
    }
};
