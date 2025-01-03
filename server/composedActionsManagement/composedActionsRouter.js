const express = require("express");
const router = express.Router();
const composedService = require("./composedActionsService");
const auth = require("../middleware/auth");

router.patch("/composed/:sectionId/observe", composedService.observeSection);

module.exports = router;
