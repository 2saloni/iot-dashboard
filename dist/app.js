"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("./config/database.config");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
// Load environment variables
dotenv_1.default.config();
class App {
    constructor() {
        this.gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
            try {
                await (0, database_config_1.closeDatabase)();
                console.log('✅ Graceful shutdown completed');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during graceful shutdown:', error);
                process.exit(1);
            }
        };
        this.app = (0, express_1.default)();
        this.port = process.env.APP_PORT || 3000;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        // Parse JSON bodies
        this.app.use(express_1.default.json({ limit: '10mb' }));
        // Parse URL-encoded bodies
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
        // CORS headers (basic setup - customize as needed)
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
                return;
            }
            next();
        });
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Server is running',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });
        // API routes
        this.app.use('/api', routes_1.default);
        // Handle undefined routes
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`,
                timestamp: new Date().toISOString()
            });
        });
    }
    initializeErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                timestamp: new Date().toISOString()
            });
        });
    }
    async start() {
        try {
            // Initialize database connection
            await (0, database_config_1.initializeDatabase)();
            // Start the server
            this.app.listen(this.port, () => {
                console.log(`🚀 Server is running on port ${this.port}`);
                console.log(`📍 Health check: http://localhost:${this.port}/health`);
                console.log(`🔐 Auth endpoints: http://localhost:${this.port}/api/auth`);
                console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            });
            // Graceful shutdown
            process.on('SIGTERM', this.gracefulShutdown);
            process.on('SIGINT', this.gracefulShutdown);
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.default = App;
