// ==================== Auth Models ====================

export interface LoginAppRequest {
    userName: string;
    password: string;
    deviceId: string;
    appId: string;
    verifyKey: string;
}

export interface LoginApiKeyRequest {
    userName: string;
    apiKey: string;
}

export enum LoginErrorCode {
    Success = 0,
    UserNotFound = 1,
    PasswordVerificationFailed = 2,
    InvalidCredentials = 3,
    AppNotFound = 4,
    AppVerificationFailed = 5,
    InvalidDevice = 6,
    AgreementsNotSigned = 7,
    UnknownError = 8,
    ApiSubscriptionNotFound = 9,
    ApiKeyAuthenticationDisabled = 10,
}

export interface LoginResponse {
    success: boolean;
    errorCode: LoginErrorCode;
    errorMessage?: string;
    token?: string;
}

export enum LogoutErrorCode {
    Success = 0,
    InvalidSession = 1,
    UnknownError = 2,
}

export interface LogoutResponse {
    success: boolean;
    errorCode: LogoutErrorCode;
    errorMessage?: string;
}

export enum ValidateErrorCode {
    Success = 0,
    InvalidSession = 1,
    SessionNotFound = 2,
    ExpiredToken = 3,
    UnknownError = 4,
}

export interface ValidateResponse {
    success: boolean;
    errorCode: ValidateErrorCode;
    errorMessage?: string;
    newToken?: string;
}

// Internal session model
export interface Session {
    token: string;
    userName: string;
    createdAt: Date;
    expiresAt: Date;
}
