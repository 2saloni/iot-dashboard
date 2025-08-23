import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './config/database.config';
import routes from './routes';
import cors from 'cors';

// Load environment variables
// dotenv.config();

class App {
    public app: Application;
    private port: string | number;

    constructor() {
       
        this.app = express();
        this.port = process.env.APP_PORT || 3000;

       

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        // Parse JSON bodies
        this.app.use(express.json({ limit: '10mb' }));

        // Parse URL-encoded bodies
        this.app.use(express.urlencoded({ extended: true }));

         this.app.use(cors());

        // CORS headers (basic setup - customize as needed)
        this.app.use((req: Request, res: Response, next: NextFunction) => {
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
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'Server is running',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // API routes
        this.app.use('/api', routes);

        // Handle undefined routes
        this.app.use('*', (req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`,
                timestamp: new Date().toISOString()
            });
        });
    }

    private initializeErrorHandling(): void {
        // Global error handler
        this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Global error handler:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                timestamp: new Date().toISOString()
            });
        });
    }

    public async start(): Promise<void> {
        try {
            // Initialize database connection
            await initializeDatabase();

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

        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }

    private gracefulShutdown = async (signal: string): Promise<void> => {
        console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

        try {
            await closeDatabase();
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during graceful shutdown:', error);
            process.exit(1);
        }
    };
}

export default App;
