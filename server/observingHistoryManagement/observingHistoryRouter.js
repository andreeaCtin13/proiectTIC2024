const express = require("express");
const router = express.Router();

const observingHistoryService = require("./observingHistoryService");
router.get("/statistics", observingHistoryService.getStatistics);

module.exports = router;
