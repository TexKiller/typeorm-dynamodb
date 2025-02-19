export declare class Order {
    static ASC: string;
    static DESC: string;
    static DEFAULT_DIRECTION: string;
    direction: string;
    property: string;
    constructor(property: string, direction?: string);
    static by(property: string, direction?: string): Order;
    static asc(property: string): Order;
    static desc(property: string): Order;
}
