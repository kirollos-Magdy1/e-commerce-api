const express = require("express");

const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

router.use(authenticate, authorize("user"));

router.route("/").post(addProductToWishlist).get(getLoggedUserWishlist);

router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
