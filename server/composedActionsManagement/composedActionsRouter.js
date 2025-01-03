const express = require("express");
const router = express.Router();
const composedService = require("./composedActionsService");
const auth = require("../middleware/auth");

router.patch("/composed/:sectionId/observe", composedService.observeSection);
router.put("/composed/release-section", composedService.releaseSection);
module.exports = router;
