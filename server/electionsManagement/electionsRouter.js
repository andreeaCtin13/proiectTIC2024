const express = require("express");
const router = express.Router();

const electionsService = require("./electionsService");
router.get("/elections", electionsService.getAllElections);
router.post("/elections", electionsService.addElection);
router.put("/elections/:id", electionsService.updateElection);
router.delete("/elections/:id", electionsService.deleteElection);

module.exports = router;
