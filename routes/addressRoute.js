const express = require("express");

const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../controllers/addressController");

const router = express.Router();

router.use(authenticate, authorize("user"));

router.route("/").post(addAddress).get(getLoggedUserAddresses);

router.delete("/:addressId", removeAddress);

module.exports = router;
