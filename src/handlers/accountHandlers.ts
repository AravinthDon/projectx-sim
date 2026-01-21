import { Application, Request, Response } from 'express';
import { DataStore } from '../store/DataStore';
import {
    SearchAccountRequest,
    SearchAccountResponse,
    SearchAccountErrorCode,
} from '../models/account';
import { applyResponseDelay } from '../utils/helpers';
import { config } from '../config/config';

/**
 * Register account endpoints
 */
export function registerAccountHandlers(app: Application, store: DataStore): void {
    // POST /api/Account/search
    app.post('/api/Account/search', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchAccountRequest;

        const accounts = request.onlyActiveAccounts
            ? store.getActiveAccounts()
            : store.getAllAccounts();

        const response: SearchAccountResponse = {
            success: true,
            errorCode: SearchAccountErrorCode.Success,
            accounts,
        };

        res.json(response);
    });
}
