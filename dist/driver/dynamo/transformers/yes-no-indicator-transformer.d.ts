import { ValueTransformer } from 'typeorm';
export declare class YesNoIndicatorTransformer implements ValueTransformer {
    from(value: string): boolean;
    to(value: boolean): string;
}
