const stripe = require("stripe")(process.env.STRIPE_SECRET);

const factory = require("./handlersFactory");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const CustomError = require("../errors");

exports.createCashOrder = async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findOne({ user: req.user.userId });
  console.log(cart);
  if (!cart)
    throw new CustomError.NotFoundError(
      `There is no such cart with id ${req.params.cartId}`
    );

  // 2) Get order price depend on cart price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user.userId,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findOneAndDelete({ user: req.user.userId });
  } else {
    throw new CustomError.NotFoundError(
      `There is no order for ${req.user.userId}`
    );
  }

  res.status(StatusCodes.CREATED).json({ status: "success", data: order });
};

exports.filterOrderForLoggedUser = async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user.userId };
  next();
};
exports.findAllOrders = factory.getAll(Order);

exports.findSpecificOrder = factory.getOne(Order);

exports.updateOrderToPaid = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    throw new CustomError.NotFoundError(
      `There is no such a order with this id:${req.params.id}`
    );

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(StatusCodes.OK).json({ status: "success", data: updatedOrder });
};

exports.updateOrderToDelivered = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    throw new CustomError.NotFoundError(
      `There is no such a order with this id:${req.params.id}`
    );

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(StatusCodes.OK).json({ status: "success", data: updatedOrder });
};

exports.checkoutSession = async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId and user
  const user = await User.findById(req.user.userId);
  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart)
    throw new CustomError.NotFoundError(
      `There is no such cart for this user id ${req.user.userId}`
    );

  // 2) Get order price depend on cart price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: "products",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/cart`,
    customer_email: user.email,
    client_reference_id: cart._id.toString(),
    metadata: req.body.shippingAddress,
  });
  // 4) send session to response
  res.status(StatusCodes.OK).json({ status: "success", session });
};

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

exports.webhookCheckout = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }

  res.status(StatusCodes.OK).json({ received: true });
};
