const express = require("express");
const {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../controllers/orderController");

const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const router = express.Router();

router.use(authenticate);

router.get("/checkout-session", authorize("user"), checkoutSession);

router.route("/").post(authorize("user"), createCashOrder);
router.get("/", authorize("user"), filterOrderForLoggedUser, findAllOrders);
router.get("/:id", authorize("user"), findSpecificOrder);

router.route("/admin/allOrders").get(authorize("admin"), findAllOrders);
router.put("/:id/pay", authorize("admin"), updateOrderToPaid);
router.put("/:id/deliver", authorize("admin"), updateOrderToDelivered);

module.exports = router;
