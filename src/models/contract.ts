// ==================== Contract Models ====================

export interface ContractModel {
    id: string;
    name: string;
    description: string;
    tickSize: number;
    tickValue: number;
    activeContract: boolean;
    symbolId: string;
}

export interface SearchContractRequest {
    searchText?: string;
    live: boolean;
}

export enum SearchContractErrorCode {
    Success = 0,
}

export interface SearchContractResponse {
    success: boolean;
    errorCode: SearchContractErrorCode;
    errorMessage?: string;
    contracts?: ContractModel[];
}

export interface SearchContractByIdRequest {
    contractId: string;
}

export enum SearchContractByIdErrorCode {
    Success = 0,
    ContractNotFound = 1,
}

export interface SearchContractByIdResponse {
    success: boolean;
    errorCode: SearchContractByIdErrorCode;
    errorMessage?: string;
    contract?: ContractModel;
}

export interface ListAvailableContractRequest {
    live: boolean;
}

export enum ListAvailableContractErrorCode {
    Success = 0,
}

export interface ListAvailableContractResponse {
    success: boolean;
    errorCode: ListAvailableContractErrorCode;
    errorMessage?: string;
    contracts?: ContractModel[];
}
