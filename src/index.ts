import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../public/swagger.json';
import { config } from './config/config';
import { logger } from './utils/logger';
import { DataStore } from './store/DataStore';
import { initializeMockData } from './store/mockData';
import { UserHub } from './hubs/UserHub';
import { MarketHub } from './hubs/MarketHub';

// Handlers
import { registerAuthHandlers } from './handlers/authHandlers';
import { registerAccountHandlers } from './handlers/accountHandlers';
import { registerContractHandlers } from './handlers/contractHandlers';
import { registerOrderHandlers } from './handlers/orderHandlers';
import { registerPositionHandlers } from './handlers/positionHandlers';
import { registerHistoryHandlers } from './handlers/historyHandlers';
import { registerTradeHandlers } from './handlers/tradeHandlers';
import { registerStatusHandlers } from './handlers/statusHandlers';

async function main() {
    logger.info('Starting ProjectX-Sim Mock Server...');

    // Initialize Express app
    const app: Application = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public')); // Serve static files

    // Request logging
    app.use((req, _res, next) => {
        logger.info(`${req.method} ${req.path}`);
        next();
    });

    // Initialize data store with mock data
    const store = DataStore.getInstance();
    initializeMockData(store, config.mockData);
    logger.info('Mock data initialized');

    // Initialize WebSocket hubs (before handlers so they can use them)
    const userHub = new UserHub(store);
    const marketHub = new MarketHub(store);

    // Register REST API routes (pass userHub for real-time updates)
    registerAuthHandlers(app, store);
    registerAccountHandlers(app, store);
    registerContractHandlers(app, store);
    registerOrderHandlers(app, store, userHub);
    registerPositionHandlers(app, store, userHub);
    registerHistoryHandlers(app, store);
    registerTradeHandlers(app, store);
    registerStatusHandlers(app);
    logger.info('All handlers registered');

    // Swagger UI documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    logger.info('📚 Swagger UI available at /api-docs');

    // Error handler
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        logger.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    // Create HTTP server (needed for WebSocket)
    const httpServer = http.createServer(app);

    // Create WebSocket servers
    const wssUser = new WebSocket.Server({ noServer: true });
    const wssMarket = new WebSocket.Server({ noServer: true });

    // Handle WebSocket upgrade requests
    httpServer.on('upgrade', (request, socket, head) => {
        const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
        logger.info(`WebSocket upgrade request: ${pathname}`);

        if (pathname === '/hubs/user') {
            logger.info('Routing to User Hub');
            wssUser.handleUpgrade(request, socket, head, (ws) => {
                wssUser.emit('connection', ws, request);
            });
        } else if (pathname === '/hubs/market') {
            logger.info('Routing to Market Hub');
            wssMarket.handleUpgrade(request, socket, head, (ws) => {
                wssMarket.emit('connection', ws, request);
            });
        } else {
            logger.warn(`Unknown WebSocket path: ${pathname}`);
            socket.destroy();
        }
    });

    // Handle WebSocket connections
    wssUser.on('connection', (ws) => {
        userHub.handleConnection(ws);
    });

    wssMarket.on('connection', (ws) => {
        marketHub.handleConnection(ws);
    });

    // Start market data generation when enabled
    if (config.features.enableMarketDataStreaming) {
        marketHub.startMarketDataGeneration();
    }

    // Start HTTP server
    httpServer.listen(config.server.port, config.server.host, () => {
        logger.info(`🚀 Server running at http://${config.server.host}:${config.server.port}`);
        logger.info(`📊 Mock Accounts: ${config.mockData.numAccounts}`);
        logger.info(`📈 Mock Contracts: ${config.mockData.numContracts}`);
        logger.info(`🔐 Auth Mode: ${config.auth.mode}`);
        logger.info(`🔌 WebSocket User Hub: ws://${config.server.host}:${config.server.port}/hubs/user`);
        logger.info(`🔌 WebSocket Market Hub: ws://${config.server.host}:${config.server.port}/hubs/market`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        marketHub.stopMarketDataGeneration();
        httpServer.close(() => {
            logger.info('Server closed');
            process.exit(0);
        });
    });
}

main().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});
