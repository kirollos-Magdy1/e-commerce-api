const User = require("../models/User");

exports.addProductToWishlist = async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
};

exports.removeProductFromWishlist = async (req, res, next) => {
  // $pull => remove productId from wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
};

exports.getLoggedUserWishlist = async (req, res, next) => {
  const user = await User.findById(req.user.userId).populate("wishlist");

  res.status(StatusCodes.OK).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
};
