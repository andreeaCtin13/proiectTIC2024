const express = require("express");
const router = express.Router();
const userService = require("./userService");
const {
  userValidationRules,
  loginValidationRules,
} = require("../validators/userValidator");
const auth = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const authorizeObserver = require("../middleware/authObserver");
const authorizeAdmin = require("../middleware/authAdmin");

router.get("/users", auth, userService.getAllUsers);
router.post(
  "/users",
  userValidationRules(),
  validate,
  userService.registerUser
);

router.post("/login", loginValidationRules(), validate, userService.loginUser);
router.post("/logout", auth, userService.logoutUser);
router.put(
  "/saveElections",
  auth,
  authorizeObserver,
  userService.saveSelections
);
router.post(
  "/sendMail",
  auth,
  authorizeAdmin,
  userService.sendMessageToObservers
);

router.get("/userSelections/:userId", userService.getUserSelections);

module.exports = router;
