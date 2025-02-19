"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoBatchHelper = void 0;
exports.dynamoBatchHelper = {
    batch(items, batchSize) {
        let position = 0;
        batchSize = batchSize || 25;
        const batches = [];
        while (position < items.length) {
            const batch = items.slice(position, position + batchSize);
            batches.push(batch);
            position += batchSize;
        }
        return batches;
    }
};
