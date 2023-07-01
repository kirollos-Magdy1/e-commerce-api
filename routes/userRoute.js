const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const {
  getUsers,
  getUser,
  getLoggedUserData,
  updateLoggedUserData,
  deleteLoggedUserData,
  updateLoggedUserPassword,
  sendPromotionRequest,
  getPromotionRequests,
  updatePromotionStatus,
} = require("../controllers/userController");

const { logout } = require("../controllers/authController");

const {
  updateUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../validators/userValidators");
const { route } = require("express/lib/router");

router.use(authenticate);

router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/updateMe",

  updateLoggedUserValidator,
  updateLoggedUserData
);
router.delete("/deleteMe", deleteLoggedUserData);

router.route("/").get(authorize("admin"), getUsers);

router
  .route("/updateUserPassword")
  .put(updateUserPasswordValidator, updateLoggedUserPassword, logout);

// promotion requests

router
  .route("/promotionRequests")
  .post(authorize("user"), sendPromotionRequest)
  .get(authorize("admin"), getPromotionRequests);

router.put(
  "/promotionRequests/:requestId",
  authorize("admin"),
  updatePromotionStatus
);

module.exports = router;
