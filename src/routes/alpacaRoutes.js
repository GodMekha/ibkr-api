const express = require("express");
const router = express.Router();
const alpacaController = require("../controllers/alpacaController");

// Test connection
router.get("/test", alpacaController.testConnection);

// Account routes
router.get("/account", alpacaController.getAccount);
router.get("/positions", alpacaController.getPositions);
router.get("/assets", alpacaController.getAssets);

// Order routes
router.get("/orders", alpacaController.getOrders);
router.post("/orders", alpacaController.placeOrder);
router.delete("/orders/:orderId", alpacaController.cancelOrder);

// Market data routes
router.get("/market-data", alpacaController.getMarketData);
router.get("/latest-trade", alpacaController.getLatestTrade);

module.exports = router;
