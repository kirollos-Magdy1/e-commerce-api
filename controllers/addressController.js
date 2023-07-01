const User = require("../models/User");

exports.addAddress = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Address added successfully.",
    data: user.addresses,
  });
};

exports.removeAddress = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
};

exports.getLoggedUserAddresses = async (req, res, next) => {
  const user = await User.findById(req.user.userId).populate("addresses");

  res.status(StatusCodes.OK).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
};
