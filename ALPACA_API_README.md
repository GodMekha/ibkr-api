# Alpaca API Integration

Simple API integration with Alpaca broker for testing trading functionality.

## Setup

1. Get your Alpaca API credentials from [Alpaca](https://alpaca.markets/)
2. Create a `.env` file in the root directory with:

```env
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
```

3. By default, the API uses **paper trading** (simulated trading)
   - Paper trading is enabled with `paper: true` in the controller
   - Live trading requires: set `paper: false` in `alpacaController.js`
   - The SDK automatically uses the correct endpoints based on the `paper` setting

## API Endpoints

All endpoints are prefixed with `/api/alpaca`

### Test Connection

**GET** `/api/alpaca/test`
- Test if the Alpaca API is connected and working

### Account Information

**GET** `/api/alpaca/account`
- Get account details and balances

### Positions

**GET** `/api/alpaca/positions`
- Get all current positions

### Orders

**GET** `/api/alpaca/orders?status=all`
- Get all orders
- Query params: `status` (all, open, closed)

**POST** `/api/alpaca/orders`
- Place a new order
- Body:
```json
{
  "symbol": "AAPL",
  "qty": 1,
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "limit_price": 150.00  // optional
}
```

**DELETE** `/api/alpaca/orders/:orderId`
- Cancel an order

### Market Data

**GET** `/api/alpaca/market-data?symbol=AAPL&timeframe=1Day&limit=100`
- Get historical market data (candles/bars)
- Query params:
  - `symbol` (required): Stock symbol
  - `timeframe`: 1Min, 5Min, 15Min, 30Min, 1Hour, 1Day
  - `limit`: Number of bars to return (default: 100)
  - `start`: Start date (ISO format)
  - `end`: End date (ISO format)

**GET** `/api/alpaca/latest-trade?symbol=AAPL`
- Get latest trade price for a symbol

### Assets

**GET** `/api/alpaca/assets?status=active`
- Get list of tradable assets

## Testing

Use tools like Postman, curl, or any HTTP client:

```bash
# Test connection
curl http://localhost:3001/api/alpaca/test

# Get account info
curl http://localhost:3001/api/alpaca/account

# Get market data
curl http://localhost:3001/api/alpaca/market-data?symbol=AAPL&timeframe=1Day

# Place a market order
curl -X POST http://localhost:3001/api/alpaca/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "qty": 1,
    "side": "buy",
    "type": "market"
  }'
```

## Notes

- Uses paper trading by default (no real money)
- All prices in USD
- Market data may have delays depending on your subscription
- Paper trading has no rate limits
- Live trading has rate limits based on your plan

