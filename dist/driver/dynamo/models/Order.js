"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
class Order {
    constructor(property, direction) {
        this.property = property;
        this.direction = direction || Order.DEFAULT_DIRECTION;
    }
    static by(property, direction) {
        return new Order(property, direction);
    }
    static asc(property) {
        return new Order(property, Order.ASC);
    }
    static desc(property) {
        return new Order(property, Order.DESC);
    }
}
exports.Order = Order;
Order.ASC = 'ASC';
Order.DESC = 'DESC';
Order.DEFAULT_DIRECTION = Order.ASC;
