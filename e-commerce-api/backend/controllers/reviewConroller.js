const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
const createReview = async (req, res) => {
  const { product: productId } = req.body;
  //check if its a valid product before reviewing it
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct)
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  const alreadyReviewedProduct = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  //check if the product is already reviewed
  if (alreadyReviewedProduct)
    throw new CustomError.BadRequestError("Product already reviewed");
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
  const review = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ review });
};
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  //Using save() is crutial because we will use it in the post hooks i the Review model
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  checkPermissions(req.user, review.user);
  //Using remove() is crutial because we will use it in the post hooks i the Review model
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Review deleted successfuly" });
};
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
