const express = require("express");

const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require("../validators/reviewValidators");

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require("../controllers/reviewController");

const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    authenticate,
    authorize("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(authenticate, authorize("user"), updateReviewValidator, updateReview)
  .delete(authenticate, deleteReviewValidator, deleteReview);

module.exports = router;
