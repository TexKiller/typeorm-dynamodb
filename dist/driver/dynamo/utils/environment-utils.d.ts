export declare const environmentUtils: {
    isProduction(): boolean;
    isPerformance(): boolean;
    isTest(): boolean;
    isDevelopment(): boolean;
    isSandbox(): boolean;
    isLocal(): boolean;
    getNodeEnv(): string;
    getVariable(name: string): any;
    setVariable(name: string, value: any): void;
    isTrue(name: string): boolean;
};
