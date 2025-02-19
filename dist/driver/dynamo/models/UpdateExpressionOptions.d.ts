export declare enum UpdateExpressionType {
    ADD = "ADD",
    DELETE = "DELETE",
    REMOVE = "REMOVE",
    SET = "SET"
}
export declare class UpdateExpressionOptions {
    addValues?: any;
    setValues?: any;
    where: any;
    static toAttributeNames(options: UpdateExpressionOptions): any;
    static toExpressionAttributeValues(options: UpdateExpressionOptions): any;
    static toUpdateExpression(options: UpdateExpressionOptions): string;
    static _toUpdateExpression(values: any, type: UpdateExpressionType): string;
}
