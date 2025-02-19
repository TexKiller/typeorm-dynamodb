import { Order } from './Order';
export declare class Sort {
    orders: Order[];
    static UNSORTED: Sort;
    constructor(orders: Order[]);
    static parse(req: any): Sort;
    static one(property: string, direction?: string): Sort;
    static by(properties: (string | Order)[]): Sort;
}
