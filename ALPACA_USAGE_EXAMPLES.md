# Alpaca API Usage Examples

Examples of how to use the Alpaca API endpoints.

## Prerequisites

1. Get Alpaca API credentials from https://alpaca.markets/
2. Create `.env` file:
```env
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
```

3. Start the server:
```bash
npm start
```

## Example API Calls

### 1. Test Connection

Check if Alpaca API is working:

```bash
curl http://localhost:3001/api/alpaca/test
```

Expected response:
```json
{
  "success": true,
  "message": "Connected to Alpaca API successfully",
  "paper": true,
  "account_id": "ABC123..."
}
```

### 2. Get Account Information

Get account balance and details:

```bash
curl http://localhost:3001/api/alpaca/account
```

### 3. Get Current Positions

See all open positions:

```bash
curl http://localhost:3001/api/alpaca/positions
```

### 4. Get Market Data

Get historical price data for a stock:

```bash
# Get daily candles for last 100 days
curl "http://localhost:3001/api/alpaca/market-data?symbol=AAPL&timeframe=1Day&limit=100"

# Get hourly candles
curl "http://localhost:3001/api/alpaca/market-data?symbol=AAPL&timeframe=1Hour&limit=50"

# Get 5-minute candles
curl "http://localhost:3001/api/alpaca/market-data?symbol=AAPL&timeframe=5Min&limit=100"
```

Available timeframes: `1Min`, `5Min`, `15Min`, `30Min`, `1Hour`, `1Day`

### 5. Get Latest Trade Price

Get the most recent trade for a symbol:

```bash
curl "http://localhost:3001/api/alpaca/latest-trade?symbol=AAPL"
```

### 6. Get Orders

View all orders:

```bash
# All orders
curl http://localhost:3001/api/alpaca/orders?status=all

# Only open orders
curl http://localhost:3001/api/alpaca/orders?status=open

# Closed orders
curl http://localhost:3001/api/alpaca/orders?status=closed
```

### 7. Place a Market Order

Buy/Sell immediately at market price:

```bash
curl -X POST http://localhost:3001/api/alpaca/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "qty": 1,
    "side": "buy",
    "type": "market"
  }'
```

### 8. Place a Limit Order

Buy/Sell at a specific price:

```bash
curl -X POST http://localhost:3001/api/alpaca/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "qty": 1,
    "side": "buy",
    "type": "limit",
    "limit_price": 150.00,
    "time_in_force": "day"
  }'
```

### 9. Place a Stop Order

Set a stop loss order:

```bash
curl -X POST http://localhost:3001/api/alpaca/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "qty": 1,
    "side": "sell",
    "type": "stop",
    "stop_price": 145.00
  }'
```

### 10. Cancel an Order

Cancel an existing order:

```bash
curl -X DELETE http://localhost:3001/api/alpaca/orders/{order_id}
```

### 11. Get Tradable Assets

List all assets available for trading:

```bash
curl "http://localhost:3001/api/alpaca/assets?status=active"
```

## Using from JavaScript/Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/alpaca';

// Test connection
async function testConnection() {
  const response = await axios.get(`${BASE_URL}/test`);
  console.log(response.data);
}

// Get account
async function getAccount() {
  const response = await axios.get(`${BASE_URL}/account`);
  console.log(response.data);
}

// Get market data
async function getMarketData() {
  const response = await axios.get(`${BASE_URL}/market-data`, {
    params: {
      symbol: 'AAPL',
      timeframe: '1Day',
      limit: 100
    }
  });
  console.log(response.data);
}

// Place order
async function placeOrder() {
  const response = await axios.post(`${BASE_URL}/orders`, {
    symbol: 'AAPL',
    qty: 1,
    side: 'buy',
    type: 'market'
  });
  console.log(response.data);
}

// Run examples
(async () => {
  await testConnection();
  await getAccount();
  await getMarketData();
})();
```

## Using from Python

```python
import requests

BASE_URL = 'http://localhost:3001/api/alpaca'

# Test connection
def test_connection():
    response = requests.get(f'{BASE_URL}/test')
    print(response.json())

# Get account
def get_account():
    response = requests.get(f'{BASE_URL}/account')
    print(response.json())

# Get market data
def get_market_data():
    params = {
        'symbol': 'AAPL',
        'timeframe': '1Day',
        'limit': 100
    }
    response = requests.get(f'{BASE_URL}/market-data', params=params)
    print(response.json())

# Place order
def place_order():
    data = {
        'symbol': 'AAPL',
        'qty': 1,
        'side': 'buy',
        'type': 'market'
    }
    response = requests.post(f'{BASE_URL}/orders', json=data)
    print(response.json())

# Run examples
if __name__ == '__main__':
    test_connection()
    get_account()
    get_market_data()
```

## Important Notes

⚠️ **Paper Trading**: By default, all orders are executed in paper trading mode (simulated, no real money)

⚠️ **Rate Limits**: 
- Paper trading: No rate limits
- Live trading: Based on your plan

⚠️ **Market Hours**: Orders can only be placed during market hours unless you specify extended hours trading

⚠️ **Testing**: Always test with paper trading first!

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common errors:
- `401`: Invalid API credentials
- `403`: Insufficient permissions or funds
- `404`: Symbol/order not found
- `429`: Rate limit exceeded
- `500`: Server error

