import { Application, Request, Response } from 'express';
import { DataStore } from '../store/DataStore';
import { UserHub } from '../hubs/UserHub';
import {
    SearchPositionRequest,
    SearchPositionResponse,
    SearchPositionErrorCode,
    CloseContractPositionRequest,
    ClosePositionResponse,
    ClosePositionErrorCode,
    PartialCloseContractPositionRequest,
    PartialClosePositionResponse,
    PartialClosePositionErrorCode,
} from '../models/position';
import { applyResponseDelay } from '../utils/helpers';
import { config } from '../config/config';
import { logger } from '../utils/logger';

/**
 * Register position endpoints
 */
export function registerPositionHandlers(app: Application, store: DataStore, _userHub: UserHub): void {
    // POST /api/Position/searchOpen
    app.post('/api/Position/searchOpen', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchPositionRequest;

        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: SearchPositionResponse = {
                success: false,
                errorCode: SearchPositionErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        const positions = store.getOpenPositionsByAccount(request.accountId);

        const response: SearchPositionResponse = {
            success: true,
            errorCode: SearchPositionErrorCode.Success,
            positions,
        };

        res.json(response);
    });

    // POST /api/Position/closeContract
    app.post('/api/Position/closeContract', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as CloseContractPositionRequest;

        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: ClosePositionResponse = {
                success: false,
                errorCode: ClosePositionErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        const position = store.getPositionByAccountAndContract(request.accountId, request.contractId);
        if (!position) {
            const response: ClosePositionResponse = {
                success: false,
                errorCode: ClosePositionErrorCode.PositionNotFound,
                errorMessage: 'Position not found',
            };
            res.json(response);
            return;
        }

        const contract = store.getContract(request.contractId);
        if (!contract) {
            const response: ClosePositionResponse = {
                success: false,
                errorCode: ClosePositionErrorCode.ContractNotFound,
                errorMessage: 'Contract not found',
            };
            res.json(response);
            return;
        }

        // Delete the position
        store.deletePosition(position.id);
        logger.info(`Position closed: ${position.id}`);

        const response: ClosePositionResponse = {
            success: true,
            errorCode: ClosePositionErrorCode.Success,
        };

        res.json(response);
    });

    // POST /api/Position/partialCloseContract
    app.post('/api/Position/partialCloseContract', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as PartialCloseContractPositionRequest;

        const account = store.getAccount(request.accountId);
        if (!account) {
            const response: PartialClosePositionResponse = {
                success: false,
                errorCode: PartialClosePositionErrorCode.AccountNotFound,
                errorMessage: 'Account not found',
            };
            res.json(response);
            return;
        }

        const position = store.getPositionByAccountAndContract(request.accountId, request.contractId);
        if (!position) {
            const response: PartialClosePositionResponse = {
                success: false,
                errorCode: PartialClosePositionErrorCode.PositionNotFound,
                errorMessage: 'Position not found',
            };
            res.json(response);
            return;
        }

        if (request.size >= position.size) {
            const response: PartialClosePositionResponse = {
                success: false,
                errorCode: PartialClosePositionErrorCode.InvalidCloseSize,
                errorMessage: 'Close size must be less than position size',
            };
            res.json(response);
            return;
        }

        // Reduce position size
        const newSize = position.size - request.size;
        store.updatePosition(position.id, { size: newSize });

        logger.info(`Position partially closed: ${position.id} - reduced by ${request.size}`);

        const response: PartialClosePositionResponse = {
            success: true,
            errorCode: PartialClosePositionErrorCode.Success,
        };

        res.json(response);
    });
}
