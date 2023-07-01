const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");
const ApiFeatures = require("../utils/apiFeatures");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    req.body.profileImg = filename;
  }

  next();
};

exports.getUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.getLoggedUserData = async (req, res, next) => {
  req.params.id = req.user.userId;
  next();
};

exports.updateLoggedUserPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.user.userId);

  user.password = newPassword;

  await user.save();
  req.passwordChanged = true;
  next();
};

exports.updateLoggedUserData = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ data: updatedUser });
};

exports.deleteLoggedUserData = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.userId, { active: false });

  res.status(StatusCodes.NO_CONTENT).json({ status: "Success" });
};

exports.sendPromotionRequest = async (req, res, next) => {
  const admin = await User.aggregate([
    { $match: { role: "admin" } },
    { $sample: { size: 1 } },
  ]);
  admin[0].promotionRequests.push({
    user: req.user.userId,
    message: req.body.message,
  });
  await User.findByIdAndUpdate(admin[0]._id, admin[0]);

  res.status(StatusCodes.CREATED).json({ status: "request sent" });
};

exports.getPromotionRequests = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  res.status(StatusCodes.OK).json({ data: user.promotionRequests });
};

exports.updatePromotionStatus = async (req, res, next) => {
  const { status } = req.body;
  const admin = await User.findById(req.user.userId);
  const requestIndex = admin.promotionRequests.findIndex((request) => {
    return request._id.toString() === req.params.requestId;
  });
  const requestedUser = await User.findById(
    admin.promotionRequests[requestIndex].user
  );

  if (requestIndex === -1 || !requestedUser) {
    throw new CustomError.NotFoundError(`user or request not found`);
  }

  if (status.toLowerCase() === "accept") {
    await User.findByIdAndUpdate(admin._id, {
      $pull: { promotionRequests: { _id: req.params.requestId } },
    });
    requestedUser.role = "seller";
    requestedUser.save();
  } else if (status.toLowerCase() === "reject") {
    await User.findByIdAndUpdate(admin._id, {
      $pull: { promotionRequests: { _id: req.params.requestId } },
    });
  } else {
    throw new CustomError.BadRequestError("please select a valid status");
  }
  res.status(StatusCodes.OK).json({ data: `user role updated ` });
};
