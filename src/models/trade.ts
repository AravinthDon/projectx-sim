// ==================== Trade Models ====================

import { OrderSide } from './order';

export interface HalfTradeModel {
    id: number;
    accountId: number;
    contractId: string;
    creationTimestamp: string;
    price: number;
    profitAndLoss?: number;
    fees: number;
    side: OrderSide;
    size: number;
    voided: boolean;
    orderId: number;
}

export interface SearchTradeRequest {
    accountId: number;
    startTimestamp?: string;
    endTimestamp?: string;
}

export enum SearchTradeErrorCode {
    Success = 0,
    AccountNotFound = 1,
}

export interface SearchHalfTradeResponse {
    success: boolean;
    errorCode: SearchTradeErrorCode;
    errorMessage?: string;
    trades?: HalfTradeModel[];
}
