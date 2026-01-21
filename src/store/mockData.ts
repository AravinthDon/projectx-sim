import { DataStore } from './DataStore';
import { TradingAccountModel } from '../models/account';
import { ContractModel } from '../models/contract';
import { randomDecimal, randomInt } from '../utils/helpers';

interface MockDataConfig {
    numAccounts: number;
    numContracts: number;
    seed: number;
}

/**
 * Initialize the data store with mock data
 */
export function initializeMockData(store: DataStore, config: MockDataConfig): void {
    generateMockAccounts(store, config.numAccounts);
    generateMockContracts(store, config.numContracts);
}

/**
 * Generate mock trading accounts
 */
function generateMockAccounts(store: DataStore, _count: number): void {
    // Account configurations: 5x 50K, 5x 100K, 5x 150K
    const accountTiers = [
        { prefix: '50KTC', balance: 50000, count: 5 },
        { prefix: '100KTC', balance: 100000, count: 5 },
        { prefix: '150KTC', balance: 150000, count: 5 },
    ];

    let accountId = 1;

    for (const tier of accountTiers) {
        for (let i = 0; i < tier.count; i++) {
            // Generate random numbers for the account name pattern
            const randomPart1 = randomInt(100000, 999999);
            const randomPart2 = randomInt(10000000, 99999999);
            const accountName = `${tier.prefix}-V2-${randomPart1}-${randomPart2}`;

            const account: TradingAccountModel = {
                id: accountId,
                name: accountName,
                balance: tier.balance,
                canTrade: true,
                isVisible: true,
                simulated: true,
            };

            store.addAccount(account);
            accountId++;
        }
    }
}

/**
 * Generate mock futures contracts
 */
function generateMockContracts(store: DataStore, count: number): void {
    const contracts: Omit<ContractModel, 'id'>[] = [
        // E-mini S&P 500
        {
            name: 'E-mini S&P 500 Mar 2025',
            description: 'E-mini S&P 500 Futures March 2025',
            tickSize: 0.25,
            tickValue: 12.50,
            activeContract: true,
            symbolId: 'F.US.EP',
        },
        {
            name: 'E-mini S&P 500 Jun 2025',
            description: 'E-mini S&P 500 Futures June 2025',
            tickSize: 0.25,
            tickValue: 12.50,
            activeContract: true,
            symbolId: 'F.US.EP',
        },

        // E-mini NASDAQ
        {
            name: 'E-mini NASDAQ Mar 2025',
            description: 'E-mini NASDAQ-100 Futures March 2025',
            tickSize: 0.25,
            tickValue: 5.00,
            activeContract: true,
            symbolId: 'F.US.NQ',
        },
        {
            name: 'E-mini NASDAQ Jun 2025',
            description: 'E-mini NASDAQ-100 Futures June 2025',
            tickSize: 0.25,
            tickValue: 5.00,
            activeContract: true,
            symbolId: 'F.US.NQ',
        },

        // E-mini Russell 2000
        {
            name: 'E-mini Russell 2000 Mar 2025',
            description: 'E-mini Russell 2000 Futures March 2025',
            tickSize: 0.10,
            tickValue: 5.00,
            activeContract: true,
            symbolId: 'F.US.RTY',
        },

        // E-mini Dow
        {
            name: 'E-mini Dow Mar 2025',
            description: 'E-mini Dow Jones Futures March 2025',
            tickSize: 1.00,
            tickValue: 5.00,
            activeContract: true,
            symbolId: 'F.US.YM',
        },

        // Crude Oil
        {
            name: 'Crude Oil Mar 2025',
            description: 'WTI Crude Oil Futures March 2025',
            tickSize: 0.01,
            tickValue: 10.00,
            activeContract: true,
            symbolId: 'F.US.CL',
        },
        {
            name: 'Crude Oil Apr 2025',
            description: 'WTI Crude Oil Futures April 2025',
            tickSize: 0.01,
            tickValue: 10.00,
            activeContract: false,
            symbolId: 'F.US.CL',
        },

        // Gold
        {
            name: 'Gold Apr 2025',
            description: 'Gold Futures April 2025',
            tickSize: 0.10,
            tickValue: 10.00,
            activeContract: true,
            symbolId: 'F.US.GC',
        },

        // Natural Gas
        {
            name: 'Natural Gas Mar 2025',
            description: 'Natural Gas Futures March 2025',
            tickSize: 0.001,
            tickValue: 10.00,
            activeContract: true,
            symbolId: 'F.US.NG',
        },

        // Euro FX
        {
            name: 'Euro FX Mar 2025',
            description: 'Euro FX Futures March 2025',
            tickSize: 0.00005,
            tickValue: 6.25,
            activeContract: true,
            symbolId: 'F.US.6E',
        },

        // 10-Year T-Note
        {
            name: '10-Year T-Note Mar 2025',
            description: '10-Year Treasury Note Futures March 2025',
            tickSize: 0.015625,
            tickValue: 15.625,
            activeContract: true,
            symbolId: 'F.US.ZN',
        },

        // Corn
        {
            name: 'Corn Mar 2025',
            description: 'Corn Futures March 2025',
            tickSize: 0.25,
            tickValue: 12.50,
            activeContract: true,
            symbolId: 'F.US.ZC',
        },

        // Soybeans
        {
            name: 'Soybeans Mar 2025',
            description: 'Soybean Futures March 2025',
            tickSize: 0.25,
            tickValue: 12.50,
            activeContract: true,
            symbolId: 'F.US.ZS',
        },

        // Bitcoin
        {
            name: 'Bitcoin Mar 2025',
            description: 'Bitcoin Futures March 2025',
            tickSize: 5.00,
            tickValue: 25.00,
            activeContract: true,
            symbolId: 'F.US.BTC',
        },

        // Micro E-mini S&P 500
        {
            name: 'Micro E-mini S&P Mar 2025',
            description: 'Micro E-mini S&P 500 Futures March 2025',
            tickSize: 0.25,
            tickValue: 1.25,
            activeContract: true,
            symbolId: 'F.US.MES',
        },

        // Micro E-mini NASDAQ
        {
            name: 'Micro E-mini NASDAQ Mar 2025',
            description: 'Micro E-mini NASDAQ-100 Futures March 2025',
            tickSize: 0.25,
            tickValue: 0.50,
            activeContract: true,
            symbolId: 'F.US.MNQ',
        },
    ];

    // Generate contract IDs and add to store
    const months = ['H', 'M', 'U', 'Z']; // Mar, Jun, Sep, Dec
    const years = ['25', '26'];

    for (let i = 0; i < Math.min(count, contracts.length); i++) {
        const contract = contracts[i];
        const monthCode = months[randomInt(0, months.length - 1)];
        const yearCode = years[randomInt(0, years.length - 1)];

        const fullContract: ContractModel = {
            ...contract,
            id: `CON.${contract.symbolId}.${monthCode}${yearCode}`,
        };

        store.addContract(fullContract);
    }

    // Generate additional random contracts if needed
    const baseSymbols = ['EP', 'NQ', 'RTY', 'YM', 'CL', 'GC'];
    for (let i = contracts.length; i < count; i++) {
        const symbol = baseSymbols[randomInt(0, baseSymbols.length - 1)];
        const monthCode = months[randomInt(0, months.length - 1)];
        const yearCode = years[randomInt(0, years.length - 1)];

        const contract: ContractModel = {
            id: `CON.F.US.${symbol}.${monthCode}${yearCode}`,
            name: `${symbol} ${monthCode}${yearCode}`,
            description: `Futures Contract ${symbol} ${monthCode}${yearCode}`,
            tickSize: 0.25,
            tickValue: randomDecimal(5, 25, 2),
            activeContract: randomInt(0, 10) > 2, // 80% active
            symbolId: `F.US.${symbol}`,
        };

        store.addContract(contract);
    }
}
