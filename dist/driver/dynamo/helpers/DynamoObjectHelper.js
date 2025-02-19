"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotEmpty = exports.isEmpty = exports.mixin = void 0;
const mixin = (target, source) => {
    target = target || {};
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
    return target;
};
exports.mixin = mixin;
const isEmpty = (object) => {
    if (Array.isArray(object)) {
        return object === null || object.length === 0;
    }
    return (typeof object === 'undefined' ||
        object === null ||
        object === '' ||
        JSON.stringify(object) === '{}');
};
exports.isEmpty = isEmpty;
const isNotEmpty = (object) => {
    if (Array.isArray(object)) {
        return object !== null && object.length > 0;
    }
    return (typeof object !== 'undefined' &&
        object !== null &&
        object !== '' &&
        JSON.stringify(object) !== '{}');
};
exports.isNotEmpty = isNotEmpty;
