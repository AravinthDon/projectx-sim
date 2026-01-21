import WebSocket from 'ws';
import { DataStore } from '../store/DataStore';
import { logger } from '../utils/logger';
import { randomDecimal, randomInt, now } from '../utils/helpers';
import {
    GatewayQuoteEvent,
    GatewayDepthEvent,
    GatewayTradeEvent,
    DomType,
    TradeLogType,
} from '../models/realtime';

interface Subscription {
    quotes: Set<string>;
    trades: Set<string>;
    depth: Set<string>;
}

/**
 * Market Hub - Handles real-time market data updates
 */
export class MarketHub {
    private clients: Map<WebSocket, Subscription> = new Map();
    private store: DataStore;
    private marketDataInterval?: NodeJS.Timeout;

    constructor(store: DataStore) {
        this.store = store;
    }

    /**
     * Handle new WebSocket connection
     */
    public handleConnection(ws: WebSocket): void {
        logger.info('Market Hub: New connection');

        const subscription: Subscription = {
            quotes: new Set(),
            trades: new Set(),
            depth: new Set(),
        };

        this.clients.set(ws, subscription);

        ws.on('message', (data: string) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(ws, message);
            } catch (error) {
                logger.error('Market Hub: Error parsing message', error);
            }
        });

        ws.on('close', () => {
            logger.info('Market Hub: Connection closed');
            this.clients.delete(ws);
        });
    }

    /**
     * Handle incoming messages (subscription requests)
     */
    private handleMessage(ws: WebSocket, message: any): void {
        const { type, method, arguments: args } = message;

        if (type !== 'invoke') return;

        const subscription = this.clients.get(ws);
        if (!subscription) return;

        switch (method) {
            case 'SubscribeContractQuotes':
                if (args && args[0]) {
                    subscription.quotes.add(args[0]);
                    logger.debug(`Market Hub: Subscribed to quotes for ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'UnsubscribeContractQuotes':
                if (args && args[0]) {
                    subscription.quotes.delete(args[0]);
                    logger.debug(`Market Hub: Unsubscribed from quotes for ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'SubscribeContractTrades':
                if (args && args[0]) {
                    subscription.trades.add(args[0]);
                    logger.debug(`Market Hub: Subscribed to trades for ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'UnsubscribeContractTrades':
                if (args && args[0]) {
                    subscription.trades.delete(args[0]);
                    logger.debug(`Market Hub: Unsubscribed from trades for ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'SubscribeContractMarketDepth':
                if (args && args[0]) {
                    subscription.depth.add(args[0]);
                    logger.debug(`Market Hub: Subscribed to depth for ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'UnsubscribeContractMarketDepth':
                if (args && args[0]) {
                    subscription.depth.delete(args[0]);
                    logger.debug(`Market Hub: Unsubscribed from depth for ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            default:
                logger.warn(`Market Hub: Unknown method ${method}`);
        }
    }

    /**
     * Send response to client
     */
    private sendResponse(ws: WebSocket, data: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    /**
     * Start generating mock market data
     */
    public startMarketDataGeneration(): void {
        if (this.marketDataInterval) return;

        logger.info('Market Hub: Starting market data generation');

        // Generate market data every 1 second
        this.marketDataInterval = setInterval(() => {
            this.generateMarketData();
        }, 1000);
    }

    /**
     * Stop generating mock market data
     */
    public stopMarketDataGeneration(): void {
        if (this.marketDataInterval) {
            clearInterval(this.marketDataInterval);
            this.marketDataInterval = undefined;
            logger.info('Market Hub: Stopped market data generation');
        }
    }

    /**
     * Generate and broadcast mock market data
     */
    private generateMarketData(): void {
        // Get all subscribed contract IDs
        const subscribedContracts = new Set<string>();

        this.clients.forEach((subscription) => {
            subscription.quotes.forEach((contractId) => subscribedContracts.add(contractId));
            subscription.trades.forEach((contractId) => subscribedContracts.add(contractId));
            subscription.depth.forEach((contractId) => subscribedContracts.add(contractId));
        });

        if (subscribedContracts.size === 0) return;

        // Generate data for each subscribed contract
        subscribedContracts.forEach((contractId) => {
            const contract = this.store.getContract(contractId);
            if (!contract) return;

            // Generate quote data
            const basePrice = randomDecimal(4000, 5000, 2);
            const quote: GatewayQuoteEvent = {
                symbol: contract.symbolId,
                symbolName: contract.name,
                lastPrice: basePrice,
                bestBid: basePrice - randomDecimal(0.25, 1, 2),
                bestAsk: basePrice + randomDecimal(0.25, 1, 2),
                change: randomDecimal(-50, 50, 2),
                changePercent: randomDecimal(-2, 2, 2),
                open: basePrice - randomDecimal(-20, 20, 2),
                high: basePrice + randomDecimal(0, 30, 2),
                low: basePrice - randomDecimal(0, 30, 2),
                volume: randomInt(1000, 50000),
                lastUpdated: now(),
                timestamp: now(),
            };

            this.broadcastQuote(contractId, quote);

            // Sometimes generate trade events
            if (Math.random() > 0.7) {
                const trade: GatewayTradeEvent = {
                    symbolId: contract.symbolId,
                    price: basePrice + randomDecimal(-1, 1, 2),
                    timestamp: now(),
                    type: Math.random() > 0.5 ? TradeLogType.Buy : TradeLogType.Sell,
                    volume: randomInt(1, 10),
                };

                this.broadcastTrade(contractId, trade);
            }

            // Sometimes generate depth events
            if (Math.random() > 0.5) {
                const depth: GatewayDepthEvent = {
                    timestamp: now(),
                    type: Math.random() > 0.5 ? DomType.Bid : DomType.Ask,
                    price: basePrice + randomDecimal(-5, 5, 2),
                    volume: randomInt(1, 100),
                    currentVolume: randomInt(1, 50),
                };

                this.broadcastDepth(contractId, depth);
            }
        });
    }

    /**
     * Broadcast quote update
     */
    public broadcastQuote(contractId: string, quote: GatewayQuoteEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.quotes.has(contractId)) {
                this.sendEvent(ws, 'GatewayQuote', contractId, quote);
            }
        });
    }

    /**
     * Broadcast trade update
     */
    public broadcastTrade(contractId: string, trade: GatewayTradeEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.trades.has(contractId)) {
                this.sendEvent(ws, 'GatewayTrade', contractId, trade);
            }
        });
    }

    /**
     * Broadcast depth update
     */
    public broadcastDepth(contractId: string, depth: GatewayDepthEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.depth.has(contractId)) {
                this.sendEvent(ws, 'GatewayDepth', contractId, depth);
            }
        });
    }

    /**
     * Send event to client
     */
    private sendEvent(ws: WebSocket, event: string, contractId: string, data: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    type: 'event',
                    event,
                    contractId,
                    data,
                })
            );
        }
    }

    /**
     * Get number of connected clients
     */
    public getClientCount(): number {
        return this.clients.size;
    }
}
