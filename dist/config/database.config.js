"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const user_entity_1 = require("../entities/user.entity");
const device_entity_1 = require("../entities/device.entity");
const zone_entity_1 = require("../entities/zone.entity");
// Load environment variables
dotenv_1.default.config();
console.log('db-host', process.env.DB_HOST);
console.log('db-user', process.env.DB_USER);
console.log('db-pass', process.env.DB_PASS);
console.log('db-name', process.env.DB_NAME);
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_USER,
    synchronize: true,
    logging: true,
    entities: [user_entity_1.User, device_entity_1.Device, zone_entity_1.Zone]
    // migrations: ['src/migrations/**/*.ts'],
    // subscribers: ['src/subscribers/**/*.ts'],
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log('✅ Database connection initialized successfully');
    }
    catch (error) {
        console.error('❌ Error during database initialization:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const closeDatabase = async () => {
    try {
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
            console.log('✅ Database connection closed successfully');
        }
    }
    catch (error) {
        console.error('❌ Error during database connection close:', error);
        throw error;
    }
};
exports.closeDatabase = closeDatabase;
