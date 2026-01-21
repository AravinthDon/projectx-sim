import { Application, Request, Response } from 'express';
import { DataStore } from '../store/DataStore';
import {
    SearchContractRequest,
    SearchContractResponse,
    SearchContractErrorCode,
    SearchContractByIdRequest,
    SearchContractByIdResponse,
    SearchContractByIdErrorCode,
    ListAvailableContractRequest,
    ListAvailableContractResponse,
    ListAvailableContractErrorCode,
} from '../models/contract';
import { applyResponseDelay } from '../utils/helpers';
import { config } from '../config/config';

/**
 * Register contract endpoints
 */
export function registerContractHandlers(app: Application, store: DataStore): void {
    // POST /api/Contract/search
    app.post('/api/Contract/search', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchContractRequest;

        const contracts = store.searchContracts(request.searchText, request.live);

        const response: SearchContractResponse = {
            success: true,
            errorCode: SearchContractErrorCode.Success,
            contracts,
        };

        res.json(response);
    });

    // POST /api/Contract/searchById
    app.post('/api/Contract/searchById', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as SearchContractByIdRequest;

        const contract = store.getContract(request.contractId);

        if (!contract) {
            const response: SearchContractByIdResponse = {
                success: false,
                errorCode: SearchContractByIdErrorCode.ContractNotFound,
                errorMessage: 'Contract not found',
            };
            res.json(response);
            return;
        }

        const response: SearchContractByIdResponse = {
            success: true,
            errorCode: SearchContractByIdErrorCode.Success,
            contract,
        };

        res.json(response);
    });

    // POST /api/Contract/available
    app.post('/api/Contract/available', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as ListAvailableContractRequest;

        const contracts = store.searchContracts(undefined, request.live);

        const response: ListAvailableContractResponse = {
            success: true,
            errorCode: ListAvailableContractErrorCode.Success,
            contracts,
        };

        res.json(response);
    });
}
