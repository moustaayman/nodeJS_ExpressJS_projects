const CustomError = require("../errors");
const checkPermissions = (requestUser, ressourceUser) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === ressourceUser.toString()) return;
  throw new CustomError.UnauthorizedError("Unauthorized");
};
module.exports = checkPermissions;
