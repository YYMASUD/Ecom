var express = require("express");
var router = express.Router();
const orderController = require("../controllers/order");
const { verifyToken, verifyRole } = require("../auth");

// Seller routes - must be defined BEFORE /:orderId to avoid shadowing
router.get(
  "/seller/orders",
  verifyToken,
  verifyRole(["seller", "admin"]),
  orderController.getSellerOrders,
);
router.put(
  "/seller/:orderId/status",
  verifyToken,
  verifyRole(["seller", "admin"]),
  orderController.updateOrderStatus,
);
router.put(
  "/seller/:orderId/tracking",
  verifyToken,
  verifyRole(["seller", "admin"]),
  orderController.addTracking,
);

// Admin routes - must be defined BEFORE /:orderId to avoid shadowing
router.get(
  "/admin/all",
  verifyToken,
  verifyRole(["admin"]),
  orderController.getAllOrders,
);

// User routes - generic /:orderId MUST come after all static paths
router.post("/create", verifyToken, orderController.createOrder);
router.get("/", verifyToken, orderController.getUserOrders);
router.get("/:orderId", verifyToken, orderController.getOrderById);
router.put("/:orderId/cancel", verifyToken, orderController.cancelOrder);

module.exports = router;

// Made with Bob
