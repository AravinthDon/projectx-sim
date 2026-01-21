// ==================== Account Models ====================

export interface TradingAccountModel {
    id: number;
    name: string;
    balance: number;
    canTrade: boolean;
    isVisible: boolean;
    simulated: boolean;
}

export interface SearchAccountRequest {
    onlyActiveAccounts: boolean;
}

export enum SearchAccountErrorCode {
    Success = 0,
}

export interface SearchAccountResponse {
    success: boolean;
    errorCode: SearchAccountErrorCode;
    errorMessage?: string;
    accounts?: TradingAccountModel[];
}
