"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSecondaryIndex = void 0;
const typeorm_1 = require("typeorm");
/**
 * Creates a database index.
 * Can be used on entity.
 * Can create indices with composite columns when used on entity.
 */
function GlobalSecondaryIndex(options) {
    options = options || {};
    options.sortKey = options.sortKey || [];
    const name = options.name;
    const partitionColumns = Array.isArray(options.partitionKey) ? options.partitionKey : [options.partitionKey];
    return function (clsOrObject, propertyName) {
        (0, typeorm_1.getMetadataArgsStorage)().indices.push({
            target: propertyName ? clsOrObject.constructor : clsOrObject,
            name: name,
            columns: propertyName ? [propertyName] : partitionColumns,
            where: Array.isArray(options.sortKey) ? options.sortKey.join('#') : options.sortKey
        });
    };
}
exports.GlobalSecondaryIndex = GlobalSecondaryIndex;
