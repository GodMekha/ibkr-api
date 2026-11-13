const express = require("express");
const router = express.Router();
const ibkrController = require("../controllers/ibkrController");

// Define routes
router.get("/accounts", ibkrController.getAccounts);
router.get("/accounts/balances", ibkrController.getAccountBalances);
router.get("/portfolio", ibkrController.getPortfolio);
router.get("/portfolio/summary", ibkrController.getPortfolioSummary);
router.get("/market/history/:conid", ibkrController.getMarketDataHistory);
router.get("/market/snapshot/:conid", ibkrController.getMarketDataSnapshot);
router.get("/orders", ibkrController.getOrders);
router.post("/orders", ibkrController.placeOrder);
router.get("/search/:symbol", ibkrController.searchSymbol);
//getContractDetails,getTradeHistory,getMarketScanners,
router.get("/contractDetails/:id", ibkrController.getContractDetails);
router.get("/trades", ibkrController.getTradeHistory);
router.get("/marketScanners", ibkrController.getMarketScanners);

module.exports = router;
