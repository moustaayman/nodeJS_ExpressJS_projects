const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils/index");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user)
    throw new CustomError.NotFoundError(`No user found with id : ${id}`);
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name) throw new CustomError.BadRequestError("Please fill name field");
  if (!email) throw new CustomError.BadRequestError("Please fill email field");

  const user = await User.findOne({ _id: req.user.userId });

  user.name = name;
  user.email = email;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword)
    throw new CustomError.BadRequestError("Please provide your old password");
  if (!newPassword)
    throw new CustomError.BadRequestError("Please provide your new password");
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordNonRedundant = await user.comparePassword(oldPassword);
  if (!isPasswordNonRedundant)
    throw new CustomError.UnauthenticatedError(
      "Incorrect old password, please try again"
    );
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated successfuly" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
