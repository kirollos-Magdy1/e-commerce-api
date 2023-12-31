const { check } = require("express-validator");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const User = require("../models/User");
const CustomError = require("../errors");

const updateUserPasswordValidator = [
  check("oldPassword")
    .notEmpty()
    .withMessage("Password required")
    .custom(async (val, { req }) => {
      const userId = req.user.userId;
      const user = await User.findById(userId);
      console.log(val);
      console.log(user);
      if (!user || !(await user.comparePassword(val)))
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
      if (!user.isVerified)
        throw new CustomError.UnauthenticatedError("Please verify your email");
    }),

  check("newPassword")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validatorMiddleware,
];

const updateLoggedUserValidator = [
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("phone").optional().isMobilePhone().withMessage("Invalid phone number"),

  validatorMiddleware,
];
module.exports = {
  updateUserPasswordValidator,
  updateLoggedUserValidator,
};
