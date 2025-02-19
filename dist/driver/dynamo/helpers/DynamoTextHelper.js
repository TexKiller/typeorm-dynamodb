"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poundToUnderscore = void 0;
const poundToUnderscore = (text) => {
    text = text || '';
    return text.replace(/#/g, '_');
};
exports.poundToUnderscore = poundToUnderscore;
