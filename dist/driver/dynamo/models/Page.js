"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
class Page {
    constructor(content, pageable, lastEvaluatedKey) {
        this.content = content;
        this.size = pageable.pageSize;
        this.lastEvaluatedKey = lastEvaluatedKey;
        this.numberOfElements = this.content.length;
    }
}
exports.Page = Page;
