const express = require("express");
const router = express.Router();
const sectionsService = require("./sectionsService");
const auth = require("../middleware/auth");
const authorizeAdmin = require("../middleware/authAdmin");
const authorizeObserver = require("../middleware/authObserver");
const { sectionsValidationRules } = require("../validators/sectionValidator");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });
const uploadComnplaints = multer({ dest: "uploads/" });

router.get(
  "/sections",
  auth,
  authorizeObserver,
  sectionsService.getAllSections
);
router.post("/sections", auth, authorizeAdmin, sectionsService.addSections);
router.post(
  "/upload-sections",
  auth,
  authorizeAdmin,
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
router.post(
  "/sections/uploadInjusticeReport",
  auth,
  authorizeObserver,
  uploadComnplaints.single("file"),
  async (req, res) => {
    try {
      await sectionsService.uploadInjusticeReport(req, res);
    } finally {
      if (req.file) {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.warn(`File not found: ${filePath}`);
        }
      }
    }
  }
);

module.exports = router;
