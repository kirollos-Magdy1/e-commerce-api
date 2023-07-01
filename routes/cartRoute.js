const express = require("express");
const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
} = require("../controllers/cartController");

const router = express.Router();

router.use(authenticate, authorize("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

module.exports = router;
