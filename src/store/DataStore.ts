import { TradingAccountModel } from '../models/account';
import { Session } from '../models/auth';
import { ContractModel } from '../models/contract';
import { OrderModel, OrderStatus } from '../models/order';
import { PositionModel } from '../models/position';
import { HalfTradeModel } from '../models/trade';
import { logger } from '../utils/logger';

/**
 * Singleton in-memory data store for all mock data
 */
export class DataStore {
    private static instance: DataStore;

    // Data maps
    private accounts: Map<number, TradingAccountModel> = new Map();
    private contracts: Map<string, ContractModel> = new Map();
    private orders: Map<number, OrderModel> = new Map();
    private positions: Map<number, PositionModel> = new Map();
    private trades: Map<number, HalfTradeModel> = new Map();
    private sessions: Map<string, Session> = new Map();

    // ID generators
    private nextOrderId = 1;
    private nextPositionId = 1;
    private nextTradeId = 1;

    private constructor() {
        logger.info('DataStore initialized');
    }

    public static getInstance(): DataStore {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }
        return DataStore.instance;
    }

    // ==================== Account Methods ====================

    public addAccount(account: TradingAccountModel): void {
        this.accounts.set(account.id, account);
    }

    public getAccount(id: number): TradingAccountModel | undefined {
        return this.accounts.get(id);
    }

    public getAllAccounts(): TradingAccountModel[] {
        return Array.from(this.accounts.values());
    }

    public getActiveAccounts(): TradingAccountModel[] {
        return this.getAllAccounts().filter((acc) => acc.canTrade && acc.isVisible);
    }

    public updateAccountBalance(accountId: number, delta: number): void {
        const account = this.accounts.get(accountId);
        if (account) {
            account.balance += delta;
        }
    }

    // ==================== Contract Methods ====================

    public addContract(contract: ContractModel): void {
        this.contracts.set(contract.id, contract);
    }

    public getContract(id: string): ContractModel | undefined {
        return this.contracts.get(id);
    }

    public getAllContracts(): ContractModel[] {
        return Array.from(this.contracts.values());
    }

    public searchContracts(searchText?: string, liveOnly: boolean = false): ContractModel[] {
        let contracts = this.getAllContracts();

        if (liveOnly) {
            contracts = contracts.filter((c) => c.activeContract);
        }

        if (searchText) {
            const search = searchText.toLowerCase();
            contracts = contracts.filter(
                (c) =>
                    c.name.toLowerCase().includes(search) ||
                    c.description.toLowerCase().includes(search) ||
                    c.symbolId.toLowerCase().includes(search)
            );
        }

        return contracts;
    }

    // ==================== Order Methods ====================

    public createOrder(order: Omit<OrderModel, 'id'>): OrderModel {
        const newOrder: OrderModel = {
            ...order,
            id: this.nextOrderId++,
        };
        this.orders.set(newOrder.id, newOrder);
        logger.debug(`Order created: ${newOrder.id}`);
        return newOrder;
    }

    public getOrder(id: number): OrderModel | undefined {
        return this.orders.get(id);
    }

    public updateOrder(id: number, updates: Partial<OrderModel>): OrderModel | undefined {
        const order = this.orders.get(id);
        if (order) {
            Object.assign(order, updates);
            this.orders.set(id, order);
        }
        return order;
    }

    public deleteOrder(id: number): boolean {
        return this.orders.delete(id);
    }

    public getOrdersByAccount(accountId: number, startTime?: Date, endTime?: Date): OrderModel[] {
        let orders = Array.from(this.orders.values()).filter((o) => o.accountId === accountId);

        if (startTime) {
            orders = orders.filter((o) => new Date(o.creationTimestamp) >= startTime);
        }

        if (endTime) {
            orders = orders.filter((o) => new Date(o.creationTimestamp) <= endTime);
        }

        return orders;
    }

    public getOpenOrdersByAccount(accountId: number): OrderModel[] {
        return Array.from(this.orders.values()).filter(
            (o) => o.accountId === accountId && o.status === OrderStatus.Open
        );
    }

    // ==================== Position Methods ====================

    public createPosition(position: Omit<PositionModel, 'id'>): PositionModel {
        const newPosition: PositionModel = {
            ...position,
            id: this.nextPositionId++,
        };
        this.positions.set(newPosition.id, newPosition);
        logger.debug(`Position created: ${newPosition.id}`);
        return newPosition;
    }

    public getPosition(id: number): PositionModel | undefined {
        return this.positions.get(id);
    }

    public getPositionByAccountAndContract(
        accountId: number,
        contractId: string
    ): PositionModel | undefined {
        return Array.from(this.positions.values()).find(
            (p) => p.accountId === accountId && p.contractId === contractId
        );
    }

    public updatePosition(id: number, updates: Partial<PositionModel>): PositionModel | undefined {
        const position = this.positions.get(id);
        if (position) {
            Object.assign(position, updates);
            this.positions.set(id, position);
        }
        return position;
    }

    public deletePosition(id: number): boolean {
        return this.positions.delete(id);
    }

    public getOpenPositionsByAccount(accountId: number): PositionModel[] {
        return Array.from(this.positions.values()).filter((p) => p.accountId === accountId);
    }

    // ==================== Trade Methods ====================

    public createTrade(trade: Omit<HalfTradeModel, 'id'>): HalfTradeModel {
        const newTrade: HalfTradeModel = {
            ...trade,
            id: this.nextTradeId++,
        };
        this.trades.set(newTrade.id, newTrade);
        logger.debug(`Trade created: ${newTrade.id}`);
        return newTrade;
    }

    public getTrade(id: number): HalfTradeModel | undefined {
        return this.trades.get(id);
    }

    public getTradesByAccount(accountId: number, startTime?: Date, endTime?: Date): HalfTradeModel[] {
        let trades = Array.from(this.trades.values()).filter((t) => t.accountId === accountId);

        if (startTime) {
            trades = trades.filter((t) => new Date(t.creationTimestamp) >= startTime);
        }

        if (endTime) {
            trades = trades.filter((t) => new Date(t.creationTimestamp) <= endTime);
        }

        return trades;
    }

    // ==================== Session Methods ====================

    public createSession(session: Session): void {
        this.sessions.set(session.token, session);
        logger.debug(`Session created for user: ${session.userName}`);
    }

    public getSession(token: string): Session | undefined {
        return this.sessions.get(token);
    }

    public deleteSession(token: string): boolean {
        return this.sessions.delete(token);
    }

    public validateSession(token: string): Session | undefined {
        const session = this.sessions.get(token);
        if (!session) {
            return undefined;
        }

        // Check if expired
        if (new Date() > session.expiresAt) {
            this.sessions.delete(token);
            return undefined;
        }

        return session;
    }

    // ==================== Utility Methods ====================

    public getStats() {
        return {
            accounts: this.accounts.size,
            contracts: this.contracts.size,
            orders: this.orders.size,
            positions: this.positions.size,
            trades: this.trades.size,
            sessions: this.sessions.size,
        };
    }

    public clear(): void {
        this.accounts.clear();
        this.contracts.clear();
        this.orders.clear();
        this.positions.clear();
        this.trades.clear();
        this.sessions.clear();
        this.nextOrderId = 1;
        this.nextPositionId = 1;
        this.nextTradeId = 1;
        logger.info('DataStore cleared');
    }
}
