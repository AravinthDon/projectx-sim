export interface Config {
    server: {
        port: number;
        host: string;
    };
    auth: {
        mode: 'disabled' | 'relaxed' | 'strict';
        tokenExpiry: number; // seconds
    };
    mockData: {
        numAccounts: number;
        numContracts: number;
        seed: number;
    };
    features: {
        responseDelayMs: number;
        randomErrors: boolean;
        enableMarketDataStreaming: boolean;
    };
}

export const config: Config = {
    server: {
        port: parseInt(process.env.PORT || '8080', 10),
        host: process.env.HOST || '0.0.0.0',
    },
    auth: {
        mode: (process.env.AUTH_MODE as Config['auth']['mode']) || 'relaxed',
        tokenExpiry: 3600,
    },
    mockData: {
        numAccounts: 15,
        numContracts: 30,
        seed: 42,
    },
    features: {
        responseDelayMs: 0,
        randomErrors: false,
        enableMarketDataStreaming: true,
    },
};
