const express = require("express");
const router = express.Router();
const sectionsService = require("./sectionsService");
const auth = require("../middleware/auth");
const { sectionsValidationRules } = require("../validators/sectionValidator");
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

router.get(
  "/sections",
  // auth,
  sectionsService.getAllSections
);
router.post(
  "/sections",
  // auth,
  sectionsService.addSections
);
router.post(
  "/upload-sections",
  // auth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      await sectionsService.insertBulkSections(req, res);
    } finally {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

module.exports = router;
