"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentUtils = void 0;
exports.environmentUtils = {
    isProduction() {
        return exports.environmentUtils.getNodeEnv() === 'production';
    },
    isPerformance() {
        return exports.environmentUtils.getNodeEnv() === 'performance';
    },
    isTest() {
        return exports.environmentUtils.getNodeEnv() === 'test';
    },
    isDevelopment() {
        return exports.environmentUtils.getNodeEnv() === 'development';
    },
    isSandbox() {
        return exports.environmentUtils.getNodeEnv() === 'sandbox';
    },
    isLocal() {
        return exports.environmentUtils.getNodeEnv() === 'local';
    },
    getNodeEnv() {
        return exports.environmentUtils.getVariable('NODE_ENV') || '';
    },
    getVariable(name) {
        return process.env[name];
    },
    setVariable(name, value) {
        process.env[name] = value;
    },
    isTrue(name) {
        const value = process.env[name];
        return value === true || value === 'true';
    }
};
