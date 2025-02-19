"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoReadStream = void 0;
const stream_1 = require("stream");
class DynamoReadStream extends stream_1.Stream.Readable {
    constructor(repository, options) {
        super();
        this.repository = repository;
        this.options = options;
    }
    _read() {
        this.repository
            .scan(this.options)
            .then((items) => {
            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    this.push(item);
                }
                if (items.LastEvaluatedKey) {
                    this.options.exclusiveStartKey = items.LastEvaluatedKey;
                }
                else {
                    this.push(null);
                }
            }
            else {
                this.push(null);
            }
        })
            .catch((error) => {
            console.error(error);
            throw new Error('failed to stream dynamodb results');
        });
    }
}
exports.DynamoReadStream = DynamoReadStream;
