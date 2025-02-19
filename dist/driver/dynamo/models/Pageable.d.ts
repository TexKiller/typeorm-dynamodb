import { Sort } from './Sort';
export declare class Pageable {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    filter?: string;
    exclusiveStartKey?: string;
    static DEFAULT_PAGE_NUMBER: number;
    static DEFAULT_PAGE_SIZE: number;
    static ONE: number;
    constructor(pageNumber: number, pageSize?: number, sort?: Sort, exclusiveStartKey?: string);
    toQueryString(prefix?: string): string;
    static mixin(params: any, pageable?: any): any;
    static parse(req: any): Pageable;
    static getDefault(): Pageable;
    static one(sort?: Sort): Pageable;
    static of(pageNumber: number, pageSize?: number, sort?: Sort, exclusiveStartKey?: string): Pageable;
}
