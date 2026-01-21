// Real-time event models matching ProjectX SignalR events

import { TradingAccountModel } from './account';
import { OrderModel } from './order';
import { PositionModel } from './position';
import { HalfTradeModel } from './trade';

// ==================== User Hub Events ====================

// These match the exact events from ProjectX User Hub
export type GatewayUserAccountEvent = TradingAccountModel;
export type GatewayUserOrderEvent = OrderModel;
export type GatewayUserPositionEvent = PositionModel;
export type GatewayUserTradeEvent = HalfTradeModel;

// ==================== Market Hub Events ====================

export interface GatewayQuoteEvent {
    symbol: string;
    symbolName: string;
    lastPrice: number;
    bestBid: number;
    bestAsk: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    lastUpdated: string;
    timestamp: string;
}

export enum DomType {
    Unknown = 0,
    Ask = 1,
    Bid = 2,
    BestAsk = 3,
    BestBid = 4,
    Trade = 5,
    Reset = 6,
    Low = 7,
    High = 8,
    NewBestBid = 9,
    NewBestAsk = 10,
    Fill = 11,
}

export interface GatewayDepthEvent {
    timestamp: string;
    type: DomType;
    price: number;
    volume: number;
    currentVolume: number;
}

export enum TradeLogType {
    Buy = 0,
    Sell = 1,
}

export interface GatewayTradeEvent {
    symbolId: string;
    price: number;
    timestamp: string;
    type: TradeLogType;
    volume: number;
}

// ==================== WebSocket Message Format ====================

export interface WebSocketMessage {
    type: 'invoke' | 'event';
    method?: string;
    arguments?: any[];
    event?: string;
    data?: any;
}
