const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
// const { findOne } = require("../models/Review");

const fakeStripeAPI = async ({ amount, currency }) => {
  const clientSecret = "secret";
  return { clientSecret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided!");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee!"
    );
  }
  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const product = await Product.findOne({ _id: item.product });
    if (!product)
      throw new CustomError.NotFoundError(
        `No product with id : ${item.product}`
      );
    const { name, image, price, _id } = product;
    const singleOrderItem = {
      name,
      image,
      price,
      amount: item.amount,
      product: _id,
    };
    //add the item to the order
    orderItems = [...orderItems, singleOrderItem];
    //calculate the subtotal
    subtotal += item.amount * price;
  }
  //calculate the total
  const total = tax + shippingFee + subtotal;
  //get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    orderItems,
    clientSecret: paymentIntent.clientSecret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: paymentIntent.clientSecret });
};
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order)
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};
const getSingleUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getSingleUserOrders,
};
