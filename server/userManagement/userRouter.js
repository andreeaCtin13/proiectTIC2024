const express = require("express");
const router = express.Router();
const userService = require("./userService");
const {
  userValidationRules,
  loginValidationRules,
} = require("../validators/userValidator");
const auth = require("../middleware/auth");
const { validate } = require("../middleware/validate");
router.get("/users", auth, userService.getAllUsers);
router.post(
  "/users",
  userValidationRules(),
  validate,
  userService.registerUser
);
router.post("/login", loginValidationRules(), validate, userService.loginUser);
router.put("/saveElections", userService.saveSelections);
module.exports = router;
