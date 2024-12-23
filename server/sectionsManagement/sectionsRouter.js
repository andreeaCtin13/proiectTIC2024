const express = require("express");
const router = express.Router();
const sectionsService = require("./sectionsService");
const { sectionsValidationRules } = require("../validators/sectionValidator");
router.get("/sections", sectionsService.getAllSections);
router.post("/sections", sectionsService.addSections);

module.exports = router;
