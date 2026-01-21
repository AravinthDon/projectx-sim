import { Application, Request, Response } from 'express';

/**
 * Register status/health check endpoints
 */
export function registerStatusHandlers(app: Application): void {
    // GET /api/Status/ping
    app.get('/api/Status/ping', (_req: Request, res: Response) => {
        res.send('pong');
    });
}
