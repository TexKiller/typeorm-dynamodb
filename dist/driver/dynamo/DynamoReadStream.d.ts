import { Stream } from 'stream';
import { ScanOptions } from './models/ScanOptions';
import { DynamoRepository } from './repository/DynamoRepository';
export declare class DynamoReadStream<Entity> extends Stream.Readable {
    repository: DynamoRepository<Entity>;
    options: ScanOptions;
    constructor(repository: DynamoRepository<Entity>, options: ScanOptions);
    _read(): void;
}
