const { body } = require("express-validator");

const {
  checkEmailNotInUse,
} = require("../electionsManagement/electionsService");

const electionsValidationRules = () => {
  return [
    body("email", "Invalid email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom(checkEmailNotInUse),
    body("password", "Password must be at least 8 characters long")
      .isLength({ min: 8 })
      .trim(),
  ];
};

module.exports = {
  electionsValidationRules,
};
