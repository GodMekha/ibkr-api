require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const ibkrRoutes = require("./routes/ibkrRoutes");
const alpacaRoutes = require("./routes/alpacaRoutes");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use("/api", ibkrRoutes);
app.use("/api/alpaca", alpacaRoutes);

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});