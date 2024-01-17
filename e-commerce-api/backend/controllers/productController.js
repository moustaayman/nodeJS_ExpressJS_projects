const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllproducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ count: products.length, products });
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("review");
  if (!product)
    throw new CustomError.NotFoundError(
      `No product found with the id of : ${productId}`
    );
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { _id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { _id: productId } = req.params;
  const product = await Product.findOne({ productId });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully" });
};
const uploadImage = async (req, res) => {
  if (!req.files) throw new CustomError.BadRequestError("No file uploaded");
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image"))
    throw new CustomError.BadRequestError("The file selected is not an image");
  if (productImage.size > 1024 * 1024)
    throw new CustomError.BadRequestError("You reached the maximum image size");
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllproducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
