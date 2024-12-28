const express = require("express");
const router = express.Router();
const electionsService = require("./electionsService");
const { electionsValidationRules } = require("../validators/electionValidator");
const { validate } = require("../middleware/validate");
router.get("/elections", electionsService.getAllElections);
router.post("/elections", electionsService.addElections);

module.exports = router;
