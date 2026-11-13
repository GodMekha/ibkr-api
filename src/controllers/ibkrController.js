const ibkr = require("../utils/ibkrApi");
const { sendError } = require("../utils/errorHandler");
const { default: axios } = require("axios");

// Authentication helper
const authenticate = async () => {
  try {
    const status = await ibkr.get("/iserver/auth/status");
    if (status.data.authenticated) {
      return true;
    }

    const reauth = await ibkr.post("/iserver/reauthenticate");
    if (reauth.data.success) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Authentication error:", error.message);
    return false;
  }
};

// Error handling helper
const handleApiError = (error, endpoint) => {
  if (error.response) {
    const status = error.response.status;
    const message =
      error.response.data?.error ||
      error.response.data?.message ||
      error.message;

    if (status === 401) {
      return {
        status: 401,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      };
    }

    return {
      status,
      message: `API Error [${status}]: ${message}`,
    };
  } else if (error.request) {
    return {
      status: 503,
      message: "Service unavailable - no response from IBKR Gateway",
    };
  } else {
    return {
      status: 500,
      message: `Request setup error: ${error.message}`,
    };
  }
};

// Connection health check
const checkConnection = async () => {
  try {
    const response = await ibkr.get("/iserver/auth/status");
    return {
      connected: true,
      authenticated: response.data.authenticated,
      server: response.data.server,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

// Controllers
const getAccounts = async (req, res) => {
  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const response = await ibkr.get("/portfolio/accounts");
    res.status(200).json({
      success: true,
      message: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/portfolio/accounts");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const accountsRes = await ibkr.get("/portfolio/accounts");
    if (!accountsRes.data || accountsRes.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No accounts found",
      });
    }

    const accountId = accountsRes.data[0].accountId;
    const response = await ibkr.get(`/portfolio/${accountId}/positions`);
    res.status(200).json({
      success: true,
      message: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/portfolio/positions");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

const getPortfolioSummary = async (req, res) => {
  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const accountsRes = await ibkr.get("/portfolio/accounts");
    if (!accountsRes.data || accountsRes.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No accounts found",
      });
    }

    const accountId = accountsRes.data[0].accountId;
    const response = await ibkr.get(`/portfolio/${accountId}/summary`);
    res.status(200).json({
      success: true,
      message: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/portfolio/summary");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

// Market data functions (similar improvements can be applied)
const getMarketDataHistory = async (req, res) => {
  try {
    const { conid } = req.params;
    if (!conid) {
      return res.status(400).json({
        success: false,
        message: "Contract ID (conid) is required",
      });
    }

    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const historyParams = {
      conid: conid,
      period: "6m",
      bar: "1d",
      outsideRth: false,
    };

    const historyResponse = await ibkr.get("/iserver/marketdata/history", {
      params: historyParams,
    });
    const historyData = historyResponse.data;

    if (
      historyData.error ||
      !historyData.data ||
      historyData.data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error: historyData.error || "No historical data.",
      });
    }

    let symbol = "N/A";
    let description = "N/A";
    try {
      const secdefResponse = await ibkr.get("/trsrv/secdef", {
        params: { conid: conid },
      });
      if (secdefResponse.data && secdefResponse.data.length > 0) {
        const contract = secdefResponse.data[0];
        symbol = contract.symbol || contract.description || "N/A";
        description = contract.description || "N/A";
      }
    } catch (secdefError) {
      console.warn(
        `Warning: Could not fetch security definition for ${conid}.`,
      );
    }

    let snapshotData = {};
    try {
      const snapshotResponse = await ibkr.get(
        `/iserver/marketdata/snapshot?conids=${conid}&fields=31,84,86`,
      );
      snapshotData = snapshotResponse.data[0] || {};
    } catch (snapshotError) {
      console.warn(`Warning: Could not fetch market snapshot for ${conid}.`);
    }

    res.json({
      success: true,
      conid: conid,
      symbol: symbol,
      description: description,
      marketData: historyData.data,
      currentSnapshot: {
        last: snapshotData["31"] || "N/A",
        bid: snapshotData["84"] || "N/A",
        ask: snapshotData["86"] || "N/A",
      },
      source: "Delayed Market Data (Historical + Snapshot)",
    });
  } catch (error) {
    const { status, message } = handleApiError(
      error,
      "/iserver/marketdata/history",
    );
    res.status(status).json({
      success: false,
      error: message,
    });
  }
};

const getMarketDataSnapshot = async (req, res) => {
  try {
    const { conid } = req.params;
    if (!conid) {
      return res.status(400).json({
        success: false,
        message: "Contract ID (conid) is required",
      });
    }

    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const response = await ibkr.get("/iserver/marketdata/snapshot", {
      params: {
        conids: conid,
        fields: "31,84,86,44",
      },
    });

    const data = response.data[0];
    if (!data || data.error) {
      return res.status(404).json({
        success: false,
        error: data.error || "No snapshot data found.",
      });
    }

    const lastPrice = data["31"];
    const lastClose = data["44"];
    const bidPrice = data["84"];
    const askPrice = data["86"];
    const priceChange = lastPrice && lastClose ? lastPrice - lastClose : "N/A";
    const percentChange =
      lastPrice && lastClose
        ? (((lastPrice - lastClose) / lastClose) * 100).toFixed(2) + "%"
        : "N/A";

    res.json({
      success: true,
      conid: conid,
      symbol: data.symbol,
      description: data.description,
      last: lastPrice || "N/A",
      bid: bidPrice || "N/A",
      ask: askPrice || "N/A",
      lastClose: lastClose || "N/A",
      change: priceChange,
      percent_change: percentChange,
      timestamp: new Date().toISOString(),
      raw_data: data,
    });
  } catch (error) {
    const { status, message } = handleApiError(
      error,
      "/iserver/marketdata/snapshot",
    );
    res.status(status).json({
      success: false,
      error: message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const response = await ibkr.get("/iserver/account/orders");
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(
      error,
      "/iserver/account/orders",
    );
    res.status(status).json({
      success: false,
      message,
    });
  }
};

const placeOrder = async (req, res) => {
  const { conid, side, qty, price, account } = req.body;

  // Validate required fields
  if (!conid || !side || !qty || !account) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: conid, side, qty, account",
    });
  }

  const orderPayload = {
    orders: [
      {
        conid: parseInt(conid, 10),
        orderType: price ? "LMT" : "MKT",
        side: side,
        ...(price && { price: parseFloat(price) }),
        tif: "DAY",
        quantity: parseFloat(qty),
      },
    ],
  };

  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const endpoint = `/iserver/account/${account}/orders`;
    console.log(`ກຳລັງສົ່ງຄຳສັ່ງໄປທີ່: ${endpoint}`);
    console.log("Payload:", JSON.stringify(orderPayload, null, 2));

    const response = await ibkr.post(endpoint, orderPayload);

    if (response.data?.order_id) {
      res.json({
        success: true,
        message: response.data,
      });
    } else if (response.data?.confirm_id) {
      const confirmResponse = await ibkr.post(
        `/iserver/account/${account}/order/whatif`,
        {
          ...orderPayload,
          confirm_id: response.data.confirm_id,
        },
      );

      res.json({
        success: true,
        message: confirmResponse.data,
        needsConfirmation: true,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unexpected response from order endpoint",
        response: response.data,
      });
    }
  } catch (error) {
    const { status, message } = handleApiError(error, "/orders");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

const searchSymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Symbol parameter is required",
      });
    }

    const response = await ibkr.get(`/iserver/secdef/search`, {
      params: { symbol },
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No results found for symbol: ${symbol}`,
      });
    }

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/iserver/secdef/search");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

const getConnectionStatus = async (req, res) => {
  const status = await checkConnection();
  res.json({
    success: true,
    data: status,
  });
};

const getAccountBalances = async (req, res) => {
  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const accountsRes = await ibkr.get("/portfolio/accounts");
    if (!accountsRes.data || accountsRes.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No accounts found",
      });
    }

    const accountId = accountsRes.data[0].accountId;
    const response = await ibkr.get(`/portfolio/${accountId}/ledger`);

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/portfolio/ledger");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

// not use
const getContractDetails = async (req, res) => {
  try {
    const { conid } = req.params;
    if (!conid) {
      return res.status(400).json({
        success: false,
        message: "Contract ID (conid) is required",
      });
    }

    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const response = await ibkr.get(`/iserver/secdef/info`, {
      params: { conid },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/iserver/secdef/info");
    res.status(status).json({
      success: false,
      message,
    });
  }
};

//not use
const getTradeHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }
    const accountsRes = await ibkr.get("/portfolio/accounts");
    if (!accountsRes.data || accountsRes.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No accounts found",
      });
    }

    const accountId = accountsRes.data[0].accountId;
    const response = await ibkr.get(`/portfolio/${accountId}/trades`, {
      params: { days },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(error, "/portfolio/trades");
    res.status(status).json({
      success: false,
      message,
    });
  }
};
// notuse
const getMarketScanners = async (req, res) => {
  try {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser",
      });
    }

    const response = await ibkr.get("/iserver/scanner/params");

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { status, message } = handleApiError(
      error,
      "/iserver/scanner/params",
    );
    res.status(status).json({
      success: false,
      message,
    });
  }
};

module.exports = {
  getAccounts,
  getPortfolio,
  getPortfolioSummary,
  getMarketDataHistory,
  getMarketDataSnapshot,
  getOrders,
  placeOrder,
  searchSymbol,
  getConnectionStatus,
  authenticate,
  checkConnection,
  getAccountBalances,
  //
  getContractDetails,
  getTradeHistory,
  getMarketScanners,
};
