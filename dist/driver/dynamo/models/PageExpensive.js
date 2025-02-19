"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageExpensive = void 0;
class PageExpensive {
    constructor(content, pageable, total) {
        const totalPages = Math.ceil(total / pageable.pageSize);
        this.content = content;
        this.totalElements = total;
        this.totalPages = totalPages;
        this.last = pageable.pageNumber === totalPages - 1;
        this.size = pageable.pageSize;
        // eslint-disable-next-line id-blacklist
        this.number = pageable.pageNumber;
        this.first = pageable.pageNumber === 0;
        this.numberOfElements = content.length;
    }
}
exports.PageExpensive = PageExpensive;
