"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegion = void 0;
const environment_utils_1 = require("../utils/environment-utils");
const getRegion = () => {
    return environment_utils_1.environmentUtils.getVariable('DYNAMO_REGION') || environment_utils_1.environmentUtils.getVariable('AWS_REGION') || environment_utils_1.environmentUtils.getVariable('DEFAULT_AWS_REGION') || 'us-east-1';
};
exports.getRegion = getRegion;
