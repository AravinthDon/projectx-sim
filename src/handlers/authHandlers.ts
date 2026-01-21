import { Application, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DataStore } from '../store/DataStore';
import {
    LoginAppRequest,
    LoginApiKeyRequest,
    LoginResponse,
    LoginErrorCode,
    LogoutResponse,
    LogoutErrorCode,
    ValidateResponse,
    ValidateErrorCode,
    Session,
} from '../models/auth';
import { config } from '../config/config';
import { applyResponseDelay } from '../utils/helpers';
import { logger } from '../utils/logger';

/**
 * Register authentication endpoints
 */
export function registerAuthHandlers(app: Application, store: DataStore): void {
    // POST /api/Auth/loginApp
    app.post('/api/Auth/loginApp', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as LoginAppRequest;

        // In relaxed or disabled mode, accept any credentials
        if (config.auth.mode === 'disabled' || config.auth.mode === 'relaxed') {
            const token = uuidv4();
            const session: Session = {
                token,
                userName: request.userName,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + config.auth.tokenExpiry * 1000),
            };

            store.createSession(session);

            const response: LoginResponse = {
                success: true,
                errorCode: LoginErrorCode.Success,
                token,
            };

            logger.info(`User logged in (app): ${request.userName}`);
            res.json(response);
            return;
        }

        // Strict mode - validate credentials (not implemented for mock)
        const response: LoginResponse = {
            success: false,
            errorCode: LoginErrorCode.InvalidCredentials,
            errorMessage: 'Invalid credentials',
        };

        res.json(response);
    });

    // POST /api/Auth/loginKey
    app.post('/api/Auth/loginKey', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as LoginApiKeyRequest;

        // In relaxed or disabled mode, accept any API key
        if (config.auth.mode === 'disabled' || config.auth.mode === 'relaxed') {
            const token = uuidv4();
            const session: Session = {
                token,
                userName: request.userName,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + config.auth.tokenExpiry * 1000),
            };

            store.createSession(session);

            const response: LoginResponse = {
                success: true,
                errorCode: LoginErrorCode.Success,
                token,
            };

            logger.info(`User logged in (API key): ${request.userName}`);
            res.json(response);
            return;
        }

        // Strict mode - validate API key (not implemented for mock)
        const response: LoginResponse = {
            success: false,
            errorCode: LoginErrorCode.InvalidCredentials,
            errorMessage: 'Invalid API key',
        };

        res.json(response);
    });

    // POST /api/Auth/logout
    app.post('/api/Auth/logout', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const token = extractToken(req);

        if (token) {
            const deleted = store.deleteSession(token);
            if (deleted) {
                logger.info('User logged out');
                const response: LogoutResponse = {
                    success: true,
                    errorCode: LogoutErrorCode.Success,
                };
                res.json(response);
                return;
            }
        }

        const response: LogoutResponse = {
            success: false,
            errorCode: LogoutErrorCode.InvalidSession,
            errorMessage: 'Invalid or expired session',
        };

        res.json(response);
    });

    // POST /api/Auth/validate
    app.post('/api/Auth/validate', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const token = extractToken(req);

        if (!token) {
            const response: ValidateResponse = {
                success: false,
                errorCode: ValidateErrorCode.SessionNotFound,
                errorMessage: 'No token provided',
            };
            res.json(response);
            return;
        }

        const session = store.validateSession(token);

        if (!session) {
            const response: ValidateResponse = {
                success: false,
                errorCode: ValidateErrorCode.ExpiredToken,
                errorMessage: 'Session expired or not found',
            };
            res.json(response);
            return;
        }

        // Optionally refresh the token
        const newToken = uuidv4();
        const newSession: Session = {
            token: newToken,
            userName: session.userName,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + config.auth.tokenExpiry * 1000),
        };

        store.deleteSession(token);
        store.createSession(newSession);

        const response: ValidateResponse = {
            success: true,
            errorCode: ValidateErrorCode.Success,
            newToken,
        };

        res.json(response);
    });
}

/**
 * Extract bearer token from Authorization header
 */
function extractToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return undefined;
}
