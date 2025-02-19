"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigNumberTransformer = void 0;
const bignumber_js_1 = require("bignumber.js");
class BigNumberTransformer {
    from(value) {
        return new bignumber_js_1.BigNumber(value);
    }
    to(value) {
        return value ? value.toString() : null;
    }
}
exports.BigNumberTransformer = BigNumberTransformer;
