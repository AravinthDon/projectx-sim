import WebSocket from 'ws';
import { DataStore } from '../store/DataStore';
import { logger } from '../utils/logger';
import {
    GatewayUserAccountEvent,
    GatewayUserOrderEvent,
    GatewayUserPositionEvent,
    GatewayUserTradeEvent,
} from '../models/realtime';

interface Subscription {
    accountId?: number;
    accounts: boolean;
    orders: Set<number>;
    positions: Set<number>;
    trades: Set<number>;
}

/**
 * User Hub - Handles real-time updates for user accounts, orders, positions, and trades
 */
export class UserHub {
    private clients: Map<WebSocket, Subscription> = new Map();

    constructor(_store: DataStore) {
        // Store not currently used but kept for future extensions
    }

    /**
     * Handle new WebSocket connection
     */
    public handleConnection(ws: WebSocket): void {
        logger.info('User Hub: New connection');

        const subscription: Subscription = {
            accounts: false,
            orders: new Set(),
            positions: new Set(),
            trades: new Set(),
        };

        this.clients.set(ws, subscription);

        ws.on('message', (data: string) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(ws, message);
            } catch (error) {
                logger.error('User Hub: Error parsing message', error);
            }
        });

        ws.on('close', () => {
            logger.info('User Hub: Connection closed');
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
            case 'SubscribeAccounts':
                subscription.accounts = true;
                logger.debug('User Hub: Subscribed to accounts');
                this.sendResponse(ws, { type: 'result', result: true });
                break;

            case 'UnsubscribeAccounts':
                subscription.accounts = false;
                logger.debug('User Hub: Unsubscribed from accounts');
                this.sendResponse(ws, { type: 'result', result: true });
                break;

            case 'SubscribeOrders':
                if (args && args[0]) {
                    subscription.orders.add(args[0]);
                    logger.debug(`User Hub: Subscribed to orders for account ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'UnsubscribeOrders':
                if (args && args[0]) {
                    subscription.orders.delete(args[0]);
                    logger.debug(`User Hub: Unsubscribed from orders for account ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'SubscribePositions':
                if (args && args[0]) {
                    subscription.positions.add(args[0]);
                    logger.debug(`User Hub: Subscribed to positions for account ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'UnsubscribePositions':
                if (args && args[0]) {
                    subscription.positions.delete(args[0]);
                    logger.debug(`User Hub: Unsubscribed from positions for account ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'SubscribeTrades':
                if (args && args[0]) {
                    subscription.trades.add(args[0]);
                    logger.debug(`User Hub: Subscribed to trades for account ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            case 'UnsubscribeTrades':
                if (args && args[0]) {
                    subscription.trades.delete(args[0]);
                    logger.debug(`User Hub: Unsubscribed from trades for account ${args[0]}`);
                    this.sendResponse(ws, { type: 'result', result: true });
                }
                break;

            default:
                logger.warn(`User Hub: Unknown method ${method}`);
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
     * Broadcast account update to subscribed clients
     */
    public broadcastAccountUpdate(account: GatewayUserAccountEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.accounts) {
                this.sendEvent(ws, 'GatewayUserAccount', account);
            }
        });
    }

    /**
     * Broadcast order update to subscribed clients
     */
    public broadcastOrderUpdate(order: GatewayUserOrderEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.orders.has(order.accountId)) {
                this.sendEvent(ws, 'GatewayUserOrder', order);
            }
        });
    }

    /**
     * Broadcast position update to subscribed clients
     */
    public broadcastPositionUpdate(position: GatewayUserPositionEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.positions.has(position.accountId)) {
                this.sendEvent(ws, 'GatewayUserPosition', position);
            }
        });
    }

    /**
     * Broadcast trade update to subscribed clients
     */
    public broadcastTradeUpdate(trade: GatewayUserTradeEvent): void {
        this.clients.forEach((subscription, ws) => {
            if (subscription.trades.has(trade.accountId)) {
                this.sendEvent(ws, 'GatewayUserTrade', trade);
            }
        });
    }

    /**
     * Send event to client
     */
    private sendEvent(ws: WebSocket, event: string, data: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    type: 'event',
                    event,
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
