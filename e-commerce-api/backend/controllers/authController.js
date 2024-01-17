const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  //unicity
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email is already in use");
  }
  //first registered user is an admin
  const numberOfAccounts = await User.countDocuments({});
  const role = numberOfAccounts === 0 ? "admin" : "user";
  const user = await User.create({ name, email, password, role });
  //jwt
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please enter email");
  }
  if (!password) {
    throw new CustomError.BadRequestError("Please enter password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  const isPasswordAMatch = await user.comparePassword(password);
  if (!isPasswordAMatch) {
    throw new CustomError.UnauthenticatedError("Wrong password");
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "SeeYa", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

module.exports = { register, login, logout };
