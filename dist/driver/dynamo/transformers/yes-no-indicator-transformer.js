"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YesNoIndicatorTransformer = void 0;
class YesNoIndicatorTransformer {
    from(value) {
        return value === 'Y';
    }
    to(value) {
        return value === true ? 'Y' : 'N';
    }
}
exports.YesNoIndicatorTransformer = YesNoIndicatorTransformer;
