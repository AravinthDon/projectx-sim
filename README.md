# ProjectX-Sim

Mock broker server for testing the ProjectX trading API. Provides both REST API endpoints and real-time SignalR WebSocket connections.

## Features

✅ **19 REST API Endpoints** - Complete mirror of ProjectX Gateway API  
✅ **SignalR WebSocket Support** - Real-time updates via User and Market hubs  
✅ **Stateful Mock Data** - Orders affect positions, positions show in searches  
✅ **Realistic Behavior** - Mock fills, balance updates, market data streaming  
✅ **TypeScript** - Fully typed with models matching the Swagger spec  

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

Server runs on `http://localhost:8080`

## API Documentation

### REST Endpoints

See [api_endpoints.md](./docs/api_endpoints.md) for complete endpoint documentation.

**Base URL**: `http://localhost:8080/api`

Example endpoints:
- `POST /api/Auth/loginKey` - Login with API key
- `POST /api/Account/search` - Search accounts
- `POST /api/Order/place` - Place an order
- `POST /api/Position/searchOpen` - Get open positions
- `GET /api/Status/ping` - Health check

### SignalR Hubs

See [realtime_api.md](./docs/realtime_api.md) for WebSocket documentation.

**User Hub**: `ws://localhost:8080/hubs/user`  
**Market Hub**: `ws://localhost:8080/hubs/market`

## Project Structure

```
projectx-sim/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── config.ts            # Configuration
│   ├── models/                  # TypeScript models
│   │   ├── account.ts
│   │   ├── auth.ts
│   │   ├── contract.ts
│   │   ├── order.ts
│   │   ├── position.ts
│   │   ├── history.ts
│   │   └── trade.ts
│   ├── store/                   # In-memory data store
│   │   ├── DataStore.ts
│   │   └── mockData.ts
│   ├── handlers/                # REST endpoint handlers
│   │   ├── accountHandlers.ts
│   │   ├── authHandlers.ts
│   │   ├── contractHandlers.ts
│   │   ├── orderHandlers.ts
│   │   ├── positionHandlers.ts
│   │   ├── historyHandlers.ts
│   │   ├── tradeHandlers.ts
│   │   └── statusHandlers.ts
│   ├── hubs/                    # SignalR hub implementations
│   │   ├── UserHub.ts
│   │   └── MarketHub.ts
│   └── utils/
│       ├── logger.ts
│       └── helpers.ts
├── docs/                        # API documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

Edit `src/config/config.ts` to customize:
- Server port (default: 8080)
- Auth mode (disabled, relaxed, strict)
- Mock data settings
- Response delays

## Testing

```bash
# Login
curl -X POST http://localhost:8080/api/Auth/loginKey \
  -H "Content-Type: application/json" \
  -d '{"userName":"test","apiKey":"test123"}'

# Search accounts
curl -X POST http://localhost:8080/api/Account/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"onlyActiveAccounts":true}'

# Place order
curl -X POST http://localhost:8080/api/Order/place \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": 1,
    "contractId": "CON.F.US.EP.H25",
    "type": 2,
    "side": 0,
    "size": 1
  }'
```

## License

ISC
