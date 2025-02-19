"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pageable = void 0;
const Sort_1 = require("./Sort");
class Pageable {
    constructor(pageNumber, pageSize, sort, exclusiveStartKey) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize || Pageable.DEFAULT_PAGE_SIZE;
        this.sort = sort || Sort_1.Sort.UNSORTED;
        this.exclusiveStartKey = exclusiveStartKey;
    }
    toQueryString(prefix) {
        prefix = prefix || '?';
        let sort = this.sort.orders
            .map((order) => {
            return `sort=${order.property},${order.direction}`;
        })
            .join('&');
        if (sort) {
            sort = `&${sort}`;
        }
        return `${prefix}page=${this.pageNumber}&size=${this.pageSize}${sort}`;
    }
    static mixin(params, pageable) {
        if (pageable) {
            return Object.assign(Object.assign({}, params), { pageNumber: pageable.pageNumber || Pageable.DEFAULT_PAGE_NUMBER, pageSize: pageable.pageSize || Pageable.DEFAULT_PAGE_SIZE });
        }
        return params;
    }
    static parse(req) {
        const pageNumber = parseInt(req.query.page || Pageable.DEFAULT_PAGE_NUMBER);
        const pageSize = parseInt(req.query.size || Pageable.DEFAULT_PAGE_SIZE);
        const sort = Sort_1.Sort.parse(req);
        const exclusiveStartKey = req.query.exclusiveStartKey;
        return Pageable.of(pageNumber, pageSize, sort, exclusiveStartKey);
    }
    static getDefault() {
        return new Pageable(this.DEFAULT_PAGE_NUMBER);
    }
    static one(sort) {
        return new Pageable(this.DEFAULT_PAGE_NUMBER, this.ONE, sort);
    }
    static of(pageNumber, pageSize, sort, exclusiveStartKey) {
        return new Pageable(pageNumber, pageSize, sort, exclusiveStartKey);
    }
}
exports.Pageable = Pageable;
Pageable.DEFAULT_PAGE_NUMBER = 0;
Pageable.DEFAULT_PAGE_SIZE = 15;
Pageable.ONE = 1;
