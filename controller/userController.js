const asyncHandler = require("../middleware/asyncHandler");
const userModel = require("../model/userModel");
const cartModel = require("../model/cartModel");
const sendToken = require("../utils/jwt");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ success: false, message: "Invalid Credential" });
  }

  const isExist = await userModel.findOne({ email });
  if (!isExist) {
    return res.status(401).json({ success: false, message: "Invalid Credential" });
  }

  const checkPassword = await isExist.verifyPassword(password);
  if (!checkPassword) {
    return res.status(400).json({ success: false, message: "Invalid Credential" });
  }

  sendToken(isExist, res);
});

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(401).json({ success: false, message: "Invalid credential" });
  }

  const isExist = await userModel.findOne({ email });
  if (isExist) {
    return res.status(400).json({ success: false, message: "Mail already exists" });
  }

  const newUser = await userModel.create({ email, password, name });
  sendToken(newUser, res);
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logout successfully" });
});

const addCart = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { id } = req.body.product;
  const cart = await cartModel.findOne({ user: userId });

  if (cart) {
    const productExist = cart.cartItems.findIndex(item => item.product.id == id);
    if (productExist !== -1) {
      await cartModel.findOneAndUpdate(
        { user: userId, "cartItems.product.id": id },
        { $inc: { "cartItems.$.quantity": 1 } },
        { new: true }
      );
    } else {
      await cartModel.findOneAndUpdate(
        { user: userId },
        { $push: { cartItems: { product: { ...req.body.product } } } },
        { new: true }
      );
    }
    const updatedCart = await cartModel.findOne({ user: userId });
    res.status(200).json({ message: "Added Cart", total: updatedCart?.cartItems?.length });
  } else {
    const product = await cartModel.create({
      user: userId,
      cartItems: [{ product: { ...req.body.product } }],
    });
    res.status(200).json({ message: "Added Cart", total: product?.cartItems?.length });
  }
});

const removeCart = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { id } = req.body;
  const cart = await cartModel.findOne({ user: userId, "cartItems.product.id": id });

  if (!cart) return res.status(404).json({ message: "item not found" });

  const response = await cartModel.findOneAndUpdate(
    { user: userId },
    { $pull: { cartItems: { "product.id": id } } },
    { new: true }
  );
  res.status(200).json({ message: "Item removed from cart", total: response?.cartItems?.length });
});

const addCartQty = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { productId } = req.body;
  await cartModel.findOneAndUpdate(
    { user: userId, "cartItems.product.id": productId },
    { $inc: { "cartItems.$.quantity": 1 } },
    { new: true }
  );
  res.status(200).json({ message: "Added qty" });
});

const decreaseCartQty = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { productId } = req.body;
  await cartModel.findOneAndUpdate(
    { user: userId, "cartItems.product.id": productId },
    { $inc: { "cartItems.$.quantity": -1 } },
    { new: true }
  );
  res.status(200).json({ message: "Decreased qty" });
});

const getUserCart = asyncHandler(async (req, res) => {
  const { userId } = req;
  const cart = await cartModel.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Item not found" });
  res.status(200).json(cart);
});

const getCartNumber = asyncHandler(async (req, res) => {
  const { userId } = req;
  const response = await cartModel.findOne({ user: userId });
  res.status(200).json(response?.cartItems?.length || 0);
});

module.exports = {
  login,
  register,
  logout,
  addCart,
  removeCart,
  decreaseCartQty,
  addCartQty,
  getUserCart,
  getCartNumber,
};
