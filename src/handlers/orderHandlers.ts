import { Application, Request, Response } from 'express';
import { DataStore } from '../store/DataStore';
import { UserHub } from '../hubs/UserHub';
import {
    SearchOrderRequest,
    SearchOpenOrderRequest,
    SearchOrderResponse,
    SearchOrderErrorCode,
    PlaceOrderRequest,
    PlaceOrderResponse,
    PlaceOrderErrorCode,
    CancelOrderRequest,
    CancelOrderResponse,
    CancelOrderErrorCode,
    ModifyOrderRequest,
    ModifyOrderResponse,
    ModifyOrderErrorCode,
    OrderModel,
    OrderStatus,
    OrderType,
    OrderSide,
} from '../models/order';
import { PositionType } from '../models/position';
import { applyResponseDelay, now, randomDecimal } from '../utils/helpers';
import { config } from '../config/config';
import { logger } from '../utils/logger';

/**
 * Register order endpoints
 */
export function registerOrderHandlers(app: Application, store: DataStore, userHub: UserHub): void {
    // POST /api/Order/search
    app.post('/api/Order/search', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchOrderRequest;

        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: SearchOrderResponse = {
                success: false,
                errorCode: SearchOrderErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        const startTime = request.startTimestamp ? new Date(request.startTimestamp) : undefined;
        const endTime = request.endTimestamp ? new Date(request.endTimestamp) : undefined;

        const orders = store.getOrdersByAccount(request.accountId, startTime, endTime);

        const response: SearchOrderResponse = {
            success: true,
            errorCode: SearchOrderErrorCode.Success,
            orders,
        };

        res.json(response);
    });

    // POST /api/Order/searchOpen
    app.post('/api/Order/searchOpen', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchOpenOrderRequest;

        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: SearchOrderResponse = {
                success: false,
                errorCode: SearchOrderErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        const orders = store.getOpenOrdersByAccount(request.accountId);

        const response: SearchOrderResponse = {
            success: true,
            errorCode: SearchOrderErrorCode.Success,
            orders,
        };

        res.json(response);
    });

    // POST /api/Order/place
    app.post('/api/Order/place', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as PlaceOrderRequest;

        // Validate account exists
        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: PlaceOrderResponse = {
                success: false,
                errorCode: PlaceOrderErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        // Validate contract exists
        const contract = store.getContract(request.contractId);
        if (!contract) {
            const response: PlaceOrderResponse = {
                success: false,
                errorCode: PlaceOrderErrorCode.ContractNotFound,
                errorMessage: 'Contract not found',
            };
            res.json(response);
            return;
        }

        if (!contract.activeContract) {
            const response: PlaceOrderResponse = {
                success: false,
                errorCode: PlaceOrderErrorCode.ContractNotActive,
                errorMessage: 'Contract is not active',
            };
            res.json(response);
            return;
        }

        // Check if account can trade
        if (!account.canTrade) {
            const response: PlaceOrderResponse = {
                success: false,
                errorCode: PlaceOrderErrorCode.AccountRejected,
                errorMessage: 'Account cannot trade',
            };
            res.json(response);
            return;
        }

        // Create the order
        const timestamp = now();
        const order = store.createOrder({
            accountId: request.accountId,
            contractId: request.contractId,
            symbolId: contract.symbolId,
            creationTimestamp: timestamp,
            updateTimestamp: timestamp,
            status: request.type === OrderType.Market ? OrderStatus.Pending : OrderStatus.Open,
            type: request.type,
            side: request.side,
            size: request.size,
            limitPrice: request.limitPrice,
            stopPrice: request.stopPrice,
            fillVolume: 0,
            customTag: request.customTag,
        });

        logger.info(`Order placed: ${order.id} - ${request.size} ${contract.symbolId} @ ${request.limitPrice || 'market'}`);

        // Broadcast order update
        userHub.broadcastOrderUpdate(order);

        // Auto-fill market orders
        if (request.type === OrderType.Market) {
            setTimeout(() => {
                fillOrder(store, order.id, userHub);
            }, 100);
        }

        const response: PlaceOrderResponse = {
            success: true,
            errorCode: PlaceOrderErrorCode.Success,
            orderId: order.id,
        };

        res.json(response);
    });

    // POST /api/Order/cancel
    app.post('/api/Order/cancel', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as CancelOrderRequest;

        // Validate account
        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: CancelOrderResponse = {
                success: false,
                errorCode: CancelOrderErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        // Get the order
        const order = store.getOrder(request.orderId);
        if (!order) {
            const response: CancelOrderResponse = {
                success: false,
                errorCode: CancelOrderErrorCode.OrderNotFound,
                errorMessage: 'Order not found',
            };
            res.json(response);
            return;
        }

        // Verify order belongs to account
        if (order.accountId !== request.accountId) {
            const response: CancelOrderResponse = {
                success: false,
                errorCode: CancelOrderErrorCode.Rejected,
                errorMessage: 'Order does not belong to this account',
            };
            res.json(response);
            return;
        }

        // Check if order can be cancelled
        if (order.status !== OrderStatus.Open && order.status !== OrderStatus.Pending) {
            const response: CancelOrderResponse = {
                success: false,
                errorCode: CancelOrderErrorCode.Rejected,
                errorMessage: `Cannot cancel order with status ${OrderStatus[order.status]}`,
            };
            res.json(response);
            return;
        }

        // Cancel the order
        const updatedOrder = store.updateOrder(order.id, {
            status: OrderStatus.Cancelled,
            updateTimestamp: now(),
        });

        logger.info(`Order cancelled: ${order.id}`);

        // Broadcast order update
        if (updatedOrder) {
            userHub.broadcastOrderUpdate(updatedOrder);
        }

        const response: CancelOrderResponse = {
            success: true,
            errorCode: CancelOrderErrorCode.Success,
        };

        res.json(response);
    });

    // POST /api/Order/modify
    app.post('/api/Order/modify', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as ModifyOrderRequest;

        // Validate account
        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: ModifyOrderResponse = {
                success: false,
                errorCode: ModifyOrderErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        // Get the order
        const order = store.getOrder(request.orderId);
        if (!order) {
            const response: ModifyOrderResponse = {
                success: false,
                errorCode: ModifyOrderErrorCode.OrderNotFound,
                errorMessage: 'Order not found',
            };
            res.json(response);
            return;
        }

        // Verify order belongs to account
        if (order.accountId !== request.accountId) {
            const response: ModifyOrderResponse = {
                success: false,
                errorCode: ModifyOrderErrorCode.Rejected,
                errorMessage: 'Order does not belong to this account',
            };
            res.json(response);
            return;
        }

        // Check if order can be modified
        if (order.status !== OrderStatus.Open) {
            const response: ModifyOrderResponse = {
                success: false,
                errorCode: ModifyOrderErrorCode.Rejected,
                errorMessage: `Cannot modify order with status ${OrderStatus[order.status]}`,
            };
            res.json(response);
            return;
        }

        // Modify the order
        const updates: Partial<OrderModel> = {
            updateTimestamp: now(),
        };

        if (request.size !== undefined) updates.size = request.size;
        if (request.limitPrice !== undefined) updates.limitPrice = request.limitPrice;
        if (request.stopPrice !== undefined) updates.stopPrice = request.stopPrice;

        const updatedOrder = store.updateOrder(order.id, updates);

        logger.info(`Order modified: ${order.id}`);

        // Broadcast order update
        if (updatedOrder) {
            userHub.broadcastOrderUpdate(updatedOrder);
        }

        const response: ModifyOrderResponse = {
            success: true,
            errorCode: ModifyOrderErrorCode.Success,
        };

        res.json(response);
    });
}

/**
 * Fill an order and update positions
 */
function fillOrder(store: DataStore, orderId: number, userHub: UserHub): void {
    const order = store.getOrder(orderId);
    if (!order) return;

    const contract = store.getContract(order.contractId);
    if (!contract) return;

    // Simulate fill price
    const fillPrice = order.limitPrice || randomDecimal(4000, 5000, 2);

    // Update order to filled
    const filledOrder = store.updateOrder(orderId, {
        status: OrderStatus.Filled,
        fillVolume: order.size,
        filledPrice: fillPrice,
        updateTimestamp: now(),
    });

    // Broadcast filled order
    if (filledOrder) {
        userHub.broadcastOrderUpdate(filledOrder);
    }

    // Update or create position
    let position = store.getPositionByAccountAndContract(order.accountId, order.contractId);

    if (position) {
        // Update existing position
        const isSameSide =
            (position.type === PositionType.Long && order.side === OrderSide.Bid) ||
            (position.type === PositionType.Short && order.side === OrderSide.Ask);

        if (isSameSide) {
            // Adding to position
            const totalSize = position.size + order.size;
            const avgPrice =
                (position.averagePrice * position.size + fillPrice * order.size) / totalSize;

            const updatedPos = store.updatePosition(position.id, {
                size: totalSize,
                averagePrice: avgPrice,
            });
            if (updatedPos) {
                userHub.broadcastPositionUpdate(updatedPos);
            }
        } else {
            // Reducing position
            const newSize = position.size - order.size;

            if (newSize > 0) {
                store.updatePosition(position.id, {
                    size: newSize,
                });
            } else if (newSize === 0) {
                // Position closed
                store.deletePosition(position.id);
            } else {
                // Position flipped
                store.deletePosition(position.id);

                const newPosition = store.createPosition({
                    accountId: order.accountId,
                    contractId: order.contractId,
                    creationTimestamp: now(),
                    type: order.side === OrderSide.Bid ? PositionType.Long : PositionType.Short,
                    size: Math.abs(newSize),
                    averagePrice: fillPrice,
                });

                position = newPosition;
            }
        }
    } else {
        // Create new position
        position = store.createPosition({
            accountId: order.accountId,
            contractId: order.contractId,
            creationTimestamp: now(),
            type: order.side === OrderSide.Bid ? PositionType.Long : PositionType.Short,
            size: order.size,
            averagePrice: fillPrice,
        });
    }

    // Create trade record
    const trade = store.createTrade({
        accountId: order.accountId,
        contractId: order.contractId,
        creationTimestamp: now(),
        price: fillPrice,
        fees: order.size * contract.tickValue * 2, // Mock fee calculation
        side: order.side,
        size: order.size,
        voided: false,
        orderId: order.id,
    });

    // Broadcast trade update
    userHub.broadcastTradeUpdate(trade);

    // Broadcast final position if it exists
    if (position) {
        userHub.broadcastPositionUpdate(position);
    }

    logger.info(`Order filled: ${orderId} at ${fillPrice}`);
}
