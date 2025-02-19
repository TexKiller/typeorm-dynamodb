import { Pageable } from './Pageable';
export declare class PageExpensive<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    constructor(content: T[], pageable: Pageable, total: number);
}
