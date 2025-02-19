"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExpressionOptions = exports.UpdateExpressionType = void 0;
const DynamoAttributeHelper_1 = require("../helpers/DynamoAttributeHelper");
const DynamoObjectHelper_1 = require("../helpers/DynamoObjectHelper");
var UpdateExpressionType;
(function (UpdateExpressionType) {
    // eslint-disable-next-line no-unused-vars
    UpdateExpressionType["ADD"] = "ADD";
    // eslint-disable-next-line no-unused-vars
    UpdateExpressionType["DELETE"] = "DELETE";
    // eslint-disable-next-line no-unused-vars
    UpdateExpressionType["REMOVE"] = "REMOVE";
    // eslint-disable-next-line no-unused-vars
    UpdateExpressionType["SET"] = "SET";
})(UpdateExpressionType = exports.UpdateExpressionType || (exports.UpdateExpressionType = {}));
class UpdateExpressionOptions {
    static toAttributeNames(options) {
        const values = (0, DynamoObjectHelper_1.mixin)(options.addValues || {}, options.setValues || {});
        return DynamoAttributeHelper_1.dynamoAttributeHelper.toAttributeNames(values);
    }
    static toExpressionAttributeValues(options) {
        const optionValues = (0, DynamoObjectHelper_1.mixin)(options.addValues || {}, options.setValues || {});
        const keys = Object.keys(optionValues);
        const values = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const attributeName = key.replace(/#/g, '_');
            values[`:${attributeName}`] = optionValues[key];
        }
        return values;
    }
    static toUpdateExpression(options) {
        const setExpression = this._toUpdateExpression(options.setValues, UpdateExpressionType.SET);
        const addExpression = this._toUpdateExpression(options.addValues, UpdateExpressionType.ADD);
        return `${setExpression} ${addExpression}`.trim();
    }
    static _toUpdateExpression(values, type) {
        if (values) {
            const commonSeparatedValues = Object.keys(values)
                .map((key) => {
                const attributeName = key.replace(/#/g, '_');
                switch (type) {
                    case UpdateExpressionType.ADD:
                        return `#${attributeName} :${attributeName}`;
                    case UpdateExpressionType.SET:
                        return `#${attributeName} = :${attributeName}`;
                    default:
                        throw new Error(`update type is not supported yet: ${type}`);
                }
            })
                .join(', ');
            return `${type} ${commonSeparatedValues}`;
        }
        return '';
    }
}
exports.UpdateExpressionOptions = UpdateExpressionOptions;
