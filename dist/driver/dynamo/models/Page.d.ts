import { Pageable } from './Pageable';
export declare class Page<T> {
    content: T[];
    size: number;
    lastEvaluatedKey?: string;
    numberOfElements: number;
    constructor(content: T[], pageable: Pageable, lastEvaluatedKey?: string);
}
