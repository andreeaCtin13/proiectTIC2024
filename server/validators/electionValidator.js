const { body } = require("express-validator");

const electionsValidationRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Numele alegerii este obligatoriu."),
    body("observingStartDate")
      .notEmpty()
      .withMessage("Data de start este obligatorie.")
      .isISO8601()
      .withMessage(
        "Data de start trebuie să fie într-un format valid (YYYY-MM-DD)."
      )
      .custom((value) => {
        const today = new Date().toISOString().split("T")[0];
        if (value < today) {
          throw new Error(
            "Data de start trebuie să fie în viitor sau cel mult astăzi."
          );
        }
        return true;
      }),
    body("observingEndDate")
      .notEmpty()
      .withMessage("Data de sfârșit este obligatorie.")
      .isISO8601()
      .withMessage(
        "Data de sfârșit trebuie să fie într-un format valid (YYYY-MM-DD)."
      )
      .custom((value, { req }) => {
        const startDate = req.body.observingStartDate;
        if (!startDate || value < startDate) {
          throw new Error(
            "Data de sfârșit trebuie să fie după sau egală cu data de start."
          );
        }
        return true;
      })
      .custom((value) => {
        const today = new Date().toISOString().split("T")[0];
        if (value < today) {
          throw new Error(
            "Data de sfârșit trebuie să fie în viitor sau cel mult astăzi."
          );
        }
        return true;
      }),
    body("isValid")
      .optional()
      .isBoolean()
      .withMessage("Câmpul 'isValid' trebuie să fie boolean (true/false)."),
  ];
};

module.exports = {
  electionsValidationRules,
};
