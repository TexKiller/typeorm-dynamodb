"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sort = void 0;
const Order_1 = require("./Order");
class Sort {
    constructor(orders) {
        this.orders = orders;
    }
    static parse(req) {
        if (req.query.sort) {
            let sorts = req.query.sort;
            if (!Array.isArray(sorts)) {
                sorts = [sorts];
            }
            return Sort.by(sorts.map((sort) => {
                const parts = sort.split(',');
                return parts.length > 1
                    ? Order_1.Order.by(parts[0], parts[1].toUpperCase())
                    : Order_1.Order.by(parts[0]);
            }));
        }
        return Sort.UNSORTED;
    }
    static one(property, direction) {
        direction = direction || Order_1.Order.ASC;
        return Sort.by([Order_1.Order.by(property, direction)]);
    }
    static by(properties) {
        return new Sort(properties.map((property) => {
            return typeof property === 'string'
                ? Order_1.Order.by(property)
                : property;
        }));
    }
}
exports.Sort = Sort;
Sort.UNSORTED = new Sort([]);
