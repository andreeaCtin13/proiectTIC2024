const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const observingHistoryService = require("./observingHistoryService");
const authorizeAdmin = require("../middleware/authAdmin");
router.get(
  "/statistics",
  auth,
  authorizeAdmin,
  observingHistoryService.getStatistics
);

module.exports = router;
