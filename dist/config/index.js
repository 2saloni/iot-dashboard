"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = exports.AppDataSource = void 0;
var database_config_1 = require("./database.config");
Object.defineProperty(exports, "AppDataSource", { enumerable: true, get: function () { return database_config_1.AppDataSource; } });
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return database_config_1.initializeDatabase; } });
Object.defineProperty(exports, "closeDatabase", { enumerable: true, get: function () { return database_config_1.closeDatabase; } });
