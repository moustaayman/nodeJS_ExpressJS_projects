const { CustomAPIError } = require("../errors/custom-error.js");
const errorHandlerMiddleware = (error, req, res, next) => {
  if (error instanceof CustomAPIError) {
    return res.status(error.status).json({ msg: error.message });
  }
  return res.status(500).json({ msg: "Something went wrong" });
};

module.exports = errorHandlerMiddleware;
