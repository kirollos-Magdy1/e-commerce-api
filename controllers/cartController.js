const CustomError = require("../errors");

const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { StatusCodes } = require("http-status-codes");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

exports.addProductToCart = async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    // create cart fot logged user with product
    cart = await Cart.create({
      user: req.user.userId,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};

exports.getLoggedUserCart = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    throw new CustomError.NotFoundError(
      `There is no cart for this user with name : ${req.user.name}`
    );
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};

exports.removeSpecificCartItem = async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.userId },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};

exports.clearCart = async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user.userId });
  res.status(StatusCodes.NO_CONTENT).send();
};

exports.updateCartItemQuantity = async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    throw new CustomError.NotFoundError(
      `there is no cart for user ${req.user.userId}`
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    throw new CustomError.NotFoundError(
      `there is no item for this id :${req.params.itemId}`
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};
