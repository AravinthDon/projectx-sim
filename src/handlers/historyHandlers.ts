import { Application, Request, Response } from 'express';
import { DataStore } from '../store/DataStore';
import {
    RetrieveBarRequest,
    RetrieveBarResponse,
    RetrieveBarErrorCode,
    AggregateBarModel,
    AggregateBarUnit,
} from '../models/history';
import { applyResponseDelay, randomDecimal } from '../utils/helpers';
import { config } from '../config/config';

/**
 * Register history endpoints
 */
export function registerHistoryHandlers(app: Application, store: DataStore): void {
    // POST /api/History/retrieveBars
    app.post('/api/History/retrieveBars', async (req: Request, res: Response) => {
        await applyResponseDelay(config.features.responseDelayMs);

        const request = req.body as RetrieveBarRequest;

        // Validate contract exists
        const contract = store.getContract(request.contractId);
        if (!contract) {
            const response: RetrieveBarResponse = {
                success: false,
                errorCode: RetrieveBarErrorCode.ContractNotFound,
                errorMessage: 'Contract not found',
            };
            res.json(response);
            return;
        }

        // Validate parameters
        if (request.limit <= 0 || request.limit > 5000) {
            const response: RetrieveBarResponse = {
                success: false,
                errorCode: RetrieveBarErrorCode.LimitInvalid,
                errorMessage: 'Limit must be between 1 and 5000',
            };
            res.json(response);
            return;
        }

        if (request.unitNumber <= 0) {
            const response: RetrieveBarResponse = {
                success: false,
                errorCode: RetrieveBarErrorCode.UnitNumberInvalid,
                errorMessage: 'Unit number must be positive',
            };
            res.json(response);
            return;
        }

        // Generate mock bars
        const bars = generateMockBars(request);

        const response: RetrieveBarResponse = {
            success: true,
            errorCode: RetrieveBarErrorCode.Success,
            bars,
        };

        res.json(response);
    });
}

/**
 * Generate mock OHLCV bars
 */
function generateMockBars(request: RetrieveBarRequest): AggregateBarModel[] {
    const bars: AggregateBarModel[] = [];
    const startTime = new Date(request.startTime);
    const endTime = new Date(request.endTime);

    // Calculate bar interval in milliseconds
    const intervalMs = getBarIntervalMs(request.unit, request.unitNumber);

    // Generate bars
    let currentTime = new Date(startTime);
    let currentPrice = randomDecimal(4000, 5000, 2);

    while (currentTime <= endTime && bars.length < request.limit) {
        const open = currentPrice;
        const close = currentPrice + randomDecimal(-50, 50, 2);
        const high = Math.max(open, close) + randomDecimal(0, 20, 2);
        const low = Math.min(open, close) - randomDecimal(0, 20, 2);
        const volume = Math.floor(randomDecimal(100, 10000, 0));

        bars.push({
            t: currentTime.toISOString(),
            o: open,
            h: high,
            l: low,
            c: close,
            v: volume,
        });

        currentPrice = close;
        currentTime = new Date(currentTime.getTime() + intervalMs);
    }

    return bars;
}

/**
 * Get bar interval in milliseconds
 */
function getBarIntervalMs(unit: AggregateBarUnit, unitNumber: number): number {
    switch (unit) {
        case AggregateBarUnit.Second:
            return unitNumber * 1000;
        case AggregateBarUnit.Minute:
            return unitNumber * 60 * 1000;
        case AggregateBarUnit.Hour:
            return unitNumber * 60 * 60 * 1000;
        case AggregateBarUnit.Day:
            return unitNumber * 24 * 60 * 60 * 1000;
        case AggregateBarUnit.Week:
            return unitNumber * 7 * 24 * 60 * 60 * 1000;
        case AggregateBarUnit.Month:
            return unitNumber * 30 * 24 * 60 * 60 * 1000; // Approximate
        default:
            return 60 * 1000; // Default to 1 minute
    }
}
