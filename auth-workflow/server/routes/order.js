const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getSingleUserOrders,
} = require("../controllers/orderController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders)
  .post(authenticateUser, createOrder);
router.route("/getAllMyOrders").get(authenticateUser, getSingleUserOrders);
router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
