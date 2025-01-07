const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const electionsService = require("./electionsService");
router.get("/elections", auth, electionsService.getAllElections);
router.post("/elections", auth, electionsService.addElection);
router.put("/elections/:id", auth, electionsService.updateElection);
router.delete("/elections/:id", auth, electionsService.deleteElection);
router.get("/validElections", auth, electionsService.getValidElections);
module.exports = router;
