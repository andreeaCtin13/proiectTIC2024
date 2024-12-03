const express = require("express");
const router = express.Router();
const sectionsService = require("./sectionsService");
const { sectionsValidationRules } = require("../validators/sectionValidator");
const { validate } = require("../middleware/validate");
router.get("/sections", sectionsService.getAllSections);
router.post(
  "/sections",
  sectionsValidationRules(),
  validate,
  sectionsService.addSections
);

module.exports = router;
