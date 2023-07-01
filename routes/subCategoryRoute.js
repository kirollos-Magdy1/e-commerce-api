const express = require("express");

const {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} = require("../controllers/subCategoryController");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../validators/subCategoryValidators");

const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authenticate,
    authorize("admin"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObj, getSubCategories);
router

  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authenticate,
    authorize("admin"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authenticate,
    authorize("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
