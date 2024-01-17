const { isTokenValid } = require("../utils/jwt");
const CustomError = require("../errors");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token)
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new CustomError.UnauthorizedError("User not authorized");
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
