const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { electionsValidationRules } = require("../validators/electionValidator");
const { validationResult } = require("express-validator");

const electionsService = require("./electionsService");
const authorizeObserver = require("../middleware/authObserver");
const authorizeAdmin = require("../middleware/authAdmin");

router.get("/elections", auth, electionsService.getAllElections);
router.post(
  "/elections",
  auth,
  electionsValidationRules(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  },
  electionsService.addElection
);
router.put(
  "/elections/:id",
  auth,
  authorizeAdmin,
  electionsService.updateElection
);
router.delete(
  "/elections/:id",
  auth,
  authorizeAdmin,
  electionsService.deleteElection
);
router.get(
  "/validElections",
  auth,
  authorizeObserver,
  electionsService.getValidElections
);
router.get(
  "/getValidElectionsToSignUp",
  auth,
  authorizeObserver,
  electionsService.getValidElectionsToSignUp
);
module.exports = router;
