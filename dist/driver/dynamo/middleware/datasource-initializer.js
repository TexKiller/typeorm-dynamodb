"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.datasourceInitializer = void 0;
const datasource_manager_1 = require("../managers/datasource-manager");
const environment_utils_1 = require("../utils/environment-utils");
const datasourceInitializer = (options) => {
    if (environment_utils_1.environmentUtils.isLocal()) {
        datasource_manager_1.datasourceManager.open(options).then(() => {
            console.log('database created.');
        }).catch(error => {
            console.error('error creating database', error);
        });
        return (req, res, next) => {
            next();
        };
    }
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield datasource_manager_1.datasourceManager.open(options);
        next();
    });
};
exports.datasourceInitializer = datasourceInitializer;
