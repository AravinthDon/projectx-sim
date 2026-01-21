// ==================== Position Models ====================

export enum PositionType {
    Undefined = 0,
    Long = 1,
    Short = 2,
}

export interface PositionModel {
    id: number;
    accountId: number;
    contractId: string;
    creationTimestamp: string;
    type: PositionType;
    size: number;
    averagePrice: number;
}

export interface SearchPositionRequest {
    accountId: number;
}

export enum SearchPositionErrorCode {
    Success = 0,
    AccountNotFound = 1,
}

export interface SearchPositionResponse {
    success: boolean;
    errorCode: SearchPositionErrorCode;
    errorMessage?: string;
    positions?: PositionModel[];
}

export interface CloseContractPositionRequest {
    accountId: number;
    contractId: string;
}

export enum ClosePositionErrorCode {
    Success = 0,
    AccountNotFound = 1,
    PositionNotFound = 2,
    ContractNotFound = 3,
    ContractNotActive = 4,
    OrderRejected = 5,
    OrderPending = 6,
    UnknownError = 7,
    AccountRejected = 8,
}

export interface ClosePositionResponse {
    success: boolean;
    errorCode: ClosePositionErrorCode;
    errorMessage?: string;
}

export interface PartialCloseContractPositionRequest {
    accountId: number;
    contractId: string;
    size: number;
}

export enum PartialClosePositionErrorCode {
    Success = 0,
    AccountNotFound = 1,
    PositionNotFound = 2,
    ContractNotFound = 3,
    ContractNotActive = 4,
    InvalidCloseSize = 5,
    OrderRejected = 6,
    OrderPending = 7,
    UnknownError = 8,
    AccountRejected = 9,
}

export interface PartialClosePositionResponse {
    success: boolean;
    errorCode: PartialClosePositionErrorCode;
    errorMessage?: string;
}
