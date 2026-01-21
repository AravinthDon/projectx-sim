// ==================== History Models ====================

export enum AggregateBarUnit {
    Unspecified = 0,
    Second = 1,
    Minute = 2,
    Hour = 3,
    Day = 4,
    Week = 5,
    Month = 6,
}

export interface AggregateBarModel {
    t: string; // timestamp
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
}

export interface RetrieveBarRequest {
    contractId: string;
    live: boolean;
    startTime: string;
    endTime: string;
    unit: AggregateBarUnit;
    unitNumber: number;
    limit: number;
    includePartialBar: boolean;
}

export enum RetrieveBarErrorCode {
    Success = 0,
    ContractNotFound = 1,
    UnitInvalid = 2,
    UnitNumberInvalid = 3,
    LimitInvalid = 4,
}

export interface RetrieveBarResponse {
    success: boolean;
    errorCode: RetrieveBarErrorCode;
    errorMessage?: string;
    bars?: AggregateBarModel[];
}
