const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const observingHistoryService = require("./observingHistoryService");
router.get("/statistics", auth, observingHistoryService.getStatistics);

module.exports = router;
