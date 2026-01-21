import { Application, Request, Response } from 'express';
import { DataStore } from '../store/DataStore';
import {
    SearchTradeRequest,
    SearchHalfTradeResponse,
    SearchTradeErrorCode,
} from '../models/trade';
import { applyResponseDelay } from '../utils/helpers';
import { config } from '../config/config';

/**
 * Register trade endpoints
 */
export function registerTradeHandlers(app: Application, store: DataStore): void {
    // POST /api/Trade/search
    app.post('/api/Trade/search', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchTradeRequest;

        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: SearchHalfTradeResponse = {
                success: false,
                errorCode: SearchTradeErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        const startTime = request.startTimestamp ? new Date(request.startTimestamp) : undefined;
        const endTime = request.endTimestamp ? new Date(request.endTimestamp) : undefined;

        const trades = store.getTradesByAccount(request.accountId, startTime, endTime);

        const response: SearchHalfTradeResponse = {
            success: true,
            errorCode: SearchTradeErrorCode.Success,
            trades,
        };

        res.json(response);
    });
}
