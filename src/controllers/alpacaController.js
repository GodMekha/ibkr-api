const Alpaca = require("@alpacahq/alpaca-trade-api");

// Debug: Check if environment variables are loaded
const apiKey = process.env.ALPACA_API_KEY;
const secretKey = process.env.ALPACA_SECRET_KEY;

console.log("Alpaca API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND");
console.log("Alpaca Secret Key loaded:", secretKey ? `${secretKey.substring(0, 10)}...` : "NOT FOUND");

// Initialize Alpaca client with environment variables
const alpaca = new Alpaca({
  keyId: apiKey,
  secretKey: secretKey,
  paper: true, // Use paper trading (sandbox)
});

// Helper function to handle errors
const handleError = (error, res) => {
  console.error("Alpaca API Error:", error.message);
  res.status(500).json({
    success: false,
    message: error.message || "Error connecting to Alpaca API",
  });
};

// Test connection
const testConnection = async (req, res) => {
  try {
    console.log("Testing Alpaca connection...");
    const account = await alpaca.getAccount();
    console.log("Connection successful!");
    res.json({
      success: true,
      message: "Connected to Alpaca API successfully",
      paper: true,
      account_id: account.account_number,
    });
  } catch (error) {
    console.error("Connection error details:", error.message);
    console.error("Full error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to connect to Alpaca API",
      error: error.message,
      hint: "Make sure you have set ALPACA_API_KEY and ALPACA_SECRET_KEY in .env file",
    });
  }
};

// Get account information
const getAccount = async (req, res) => {
  try {
    const account = await alpaca.getAccount();
    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get positions
const getPositions = async (req, res) => {
  try {
    const positions = await alpaca.getPositions();
    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get orders
const getOrders = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const orders = await alpaca.getOrders({
      status: status, // all, open, closed, etc
    });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Place an order
const placeOrder = async (req, res) => {
  try {
    const { symbol, qty, side, type, time_in_force, limit_price, stop_price } = req.body;

    // Validate required fields
    if (!symbol || !qty || !side) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: symbol, qty, side",
      });
    }

    const order = await alpaca.createOrder({
      symbol: symbol,
      qty: parseFloat(qty),
      side: side.toLowerCase(), // buy or sell
      type: type || "market", // market, limit, stop, stop_limit
      time_in_force: time_in_force || "day", // day, gtc, ioc, fok
      ...(limit_price && { limit_price: parseFloat(limit_price) }),
      ...(stop_price && { stop_price: parseFloat(stop_price) }),
    });

    res.json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get market data (bars/candles)
const getMarketData = async (req, res) => {
  try {
    const { symbol, timeframe = "1Day", start, end, limit = 100 } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Symbol is required",
      });
    }

    const bars = await alpaca.getBarsV2(symbol, {
      start: start,
      end: end,
      timeframe: timeframe, // 1Min, 5Min, 15Min, 30Min, 1Hour, 1Day
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: bars,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get latest trade/quote
const getLatestTrade = async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Symbol is required",
      });
    }

    const trade = await alpaca.getLatestTrade(symbol);
    res.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    await alpaca.cancelOrder(orderId);
    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get all assets
const getAssets = async (req, res) => {
  try {
    const { status = "active" } = req.query;
    const assets = await alpaca.getAssets({ status: status });
    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  testConnection,
  getAccount,
  getPositions,
  getOrders,
  placeOrder,
  getMarketData,
  getLatestTrade,
  cancelOrder,
  getAssets,
};
