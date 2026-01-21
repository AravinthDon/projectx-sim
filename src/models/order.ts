// ==================== Order Models ====================

export enum OrderStatus {
    None = 0,
    Open = 1,
    Filled = 2,
    Cancelled = 3,
    Expired = 4,
    Rejected = 5,
    Pending = 6,
    PendingCancellation = 7,
    Suspended = 8,
}

export enum OrderType {
    Unknown = 0,
    Limit = 1,
    Market = 2,
    StopLimit = 3,
    Stop = 4,
    TrailingStop = 5,
    JoinBid = 6,
    JoinAsk = 7,
}

export enum OrderSide {
    Bid = 0,
    Ask = 1,
}

export interface OrderModel {
    id: number;
    accountId: number;
    contractId: string;
    symbolId: string;
    creationTimestamp: string;
    updateTimestamp?: string;
    status: OrderStatus;
    type: OrderType;
    side: OrderSide;
    size: number;
    limitPrice?: number;
    stopPrice?: number;
    fillVolume: number;
    filledPrice?: number;
    customTag?: string;
}

export interface SearchOrderRequest {
    accountId: number;
    startTimestamp: string;
    endTimestamp?: string;
}

export interface SearchOpenOrderRequest {
    accountId: number;
}

export enum SearchOrderErrorCode {
    Success = 0,
    AccountNotFound = 1,
}

export interface SearchOrderResponse {
    success: boolean;
    errorCode: SearchOrderErrorCode;
    errorMessage?: string;
    orders?: OrderModel[];
}

export interface PlaceOrderBracket {
    ticks: number;
    type: OrderType;
}

export interface PlaceOrderRequest {
    accountId: number;
    contractId: string;
    type: OrderType;
    side: OrderSide;
    size: number;
    limitPrice?: number;
    stopPrice?: number;
    trailPrice?: number;
    customTag?: string;
    stopLossBracket?: PlaceOrderBracket;
    takeProfitBracket?: PlaceOrderBracket;
}

export enum PlaceOrderErrorCode {
    Success = 0,
    AccountNotFound = 1,
    OrderRejected = 2,
    InsufficientFunds = 3,
    AccountViolation = 4,
    OutsideTradingHours = 5,
    OrderPending = 6,
    UnknownError = 7,
    ContractNotFound = 8,
    ContractNotActive = 9,
    AccountRejected = 10,
}

export interface PlaceOrderResponse {
    success: boolean;
    errorCode: PlaceOrderErrorCode;
    errorMessage?: string;
    orderId?: number;
}

export interface CancelOrderRequest {
    accountId: number;
    orderId: number;
}

export enum CancelOrderErrorCode {
    Success = 0,
    AccountNotFound = 1,
    OrderNotFound = 2,
    Rejected = 3,
    Pending = 4,
    UnknownError = 5,
    AccountRejected = 6,
}

export interface CancelOrderResponse {
    success: boolean;
    errorCode: CancelOrderErrorCode;
    errorMessage?: string;
}

export interface ModifyOrderRequest {
    accountId: number;
    orderId: number;
    size?: number;
    limitPrice?: number;
    stopPrice?: number;
    trailPrice?: number;
}

export enum ModifyOrderErrorCode {
    Success = 0,
    AccountNotFound = 1,
    OrderNotFound = 2,
    Rejected = 3,
    Pending = 4,
    UnknownError = 5,
    AccountRejected = 6,
    ContractNotFound = 7,
}

export interface ModifyOrderResponse {
    success: boolean;
    errorCode: ModifyOrderErrorCode;
    errorMessage?: string;
}
