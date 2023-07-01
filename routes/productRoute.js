const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../validators/productValidators");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productController");
const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const reviewsRoute = require("./reviewRoute");

const router = express.Router();

router.use("/:productId/reviews", reviewsRoute);

router.route("/").get(getProducts).post(
  authenticate,
  authorize("seller"),
  // uploadProductImages,
  // resizeProductImages,
  createProductValidator,
  createProduct
);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authenticate,
    authorize("seller"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authenticate,
    authorize("admin", "seller"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
