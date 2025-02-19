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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagingAndSortingRepository = void 0;
const PageExpensive_1 = require("../models/PageExpensive");
const Page_1 = require("../models/Page");
const DynamoRepository_1 = require("./DynamoRepository");
const DynamoObjectHelper_1 = require("../helpers/DynamoObjectHelper");
const encode = (json) => {
    if (json) {
        return Buffer.from(JSON.stringify(json)).toString('base64');
    }
    return undefined;
};
const decode = (data) => {
    return JSON.parse(Buffer.from(data, 'base64').toString('ascii'));
};
class PagingAndSortingRepository extends DynamoRepository_1.DynamoRepository {
    /**
     * Queries by page size and exclusiveStartKey
     */
    findPage(options, pageable) {
        return __awaiter(this, void 0, void 0, function* () {
            options.limit = (0, DynamoObjectHelper_1.isEmpty)(pageable.pageSize) ? 15 : pageable.pageSize;
            options.filter = pageable.filter || options.filter;
            options.exclusiveStartKey = pageable.exclusiveStartKey
                ? decode(pageable.exclusiveStartKey)
                : undefined;
            if (pageable.sort &&
                pageable.sort.orders &&
                pageable.sort.orders.length > 0) {
                const firstOrder = pageable.sort.orders[0];
                options.sort = firstOrder.direction;
            }
            const items = yield this.find(options);
            return new Page_1.Page(items, pageable, encode(items.lastEvaluatedKey));
        });
    }
    /**
     * Queries ALL items then returns the desired subset
     * WARNING: This is NOT an efficient way of querying dynamodb.
     * Please only use this if you must, preferably on lightly used pages
     */
    findPageWithCountExpensive(options, pageable) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageSize = (0, DynamoObjectHelper_1.isEmpty)(pageable.pageSize) ? 15 : pageable.pageSize;
            const pageNumber = (0, DynamoObjectHelper_1.isEmpty)(pageable.pageNumber)
                ? 0
                : pageable.pageNumber;
            const items = yield this.findAll(options);
            const start = pageNumber * pageSize;
            let count = (pageNumber + 1) * pageSize;
            if (start + count > items.length) {
                count = items.length - start;
            }
            const subset = items.splice(start, count);
            return new PageExpensive_1.PageExpensive(subset, pageable, subset.length + items.length);
        });
    }
}
exports.PagingAndSortingRepository = PagingAndSortingRepository;
