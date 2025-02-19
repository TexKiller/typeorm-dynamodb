import { ValueTransformer } from 'typeorm';
import { BigNumber } from 'bignumber.js';
export declare class BigNumberTransformer implements ValueTransformer {
    from(value: string): BigNumber;
    to(value: BigNumber): string | null;
}
