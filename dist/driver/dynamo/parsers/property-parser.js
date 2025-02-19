"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitOperators = void 0;
const splitOperators = (text) => {
    if (text) {
        return text.trim().split(/=|<>|<|<=|>|>=/gi);
    }
    return [];
};
exports.splitOperators = splitOperators;
