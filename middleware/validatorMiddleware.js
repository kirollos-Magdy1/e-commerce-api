const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    // throw new CustomError.BadRequestError(`${errors}`);
  }
  next();
};

module.exports = validatorMiddleware;
