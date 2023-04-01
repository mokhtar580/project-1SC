const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const path = require("path");

const User = require("../models/user");
const Product = require("../models/product");

exports.editUser = async (req, res, next) => {
  const updatedName = req.body.updatedName;
  const updatedEmail = req.body.updatedEmail;
  const updatedAdress = req.body.updatedAdress;
  const updatedPassword = req.body.updatedPassword;
  const updatedPhone = req.body.updatedPhone;
  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("the input are invalid");
    error.status = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("no user found");
      error.status = 404;
      return next(error);
    }
    if (user._id.toString() !== req.userId.toString()) {
      const error = new Error("not authorized");
      error.status = 403;
      return next(error);
    }
    if (updatedEmail !== user.email) {
      const exsistUser = await User.findOne({ email: updatedEmail });
      if (exsistUser) {
        const error = new Error(
          "the email is alerdy in use please take nother email"
        );
        error.status = 403;
        return next(error);
      }
    }
    const hashedPassword = await bcrypt.hash(updatedPassword, 12);
    user.name = updatedName;
    user.email = updatedEmail;
    user.password = hashedPassword;
    user.phoneNumber = updatedPhone;
    user.address = updatedPassword;
    user.address = updatedAdress;

    if (image) {
      if (!user.imageUrl) {
        user.imageUrl = image.path;
      } else {
        const url = user.imageUrl;
        const publicId =
          "profileImages/" + path.basename(url, path.extname(url));
        cloudinary.uploader.destroy(publicId, function (error, result) {
          if (error) {
            console.log("Error:", error);
          } else {
            console.log("Result:", result);
          }
        });
        user.imageUrl = image.path;
      }
    }
    await user.save();
    res.status(200).json({
      message: "the user is upated",
      user: user,
    });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.productId;

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("no user found");
    err.status = 404;
    return next(err);
  }
  const product = await Product.findById(productId);
  const cart = user.cart;

  const exsitsProduct = cart.items.findIndex((item) => {
    return item.productId.toString() === productId;
  });
  //console.log(exsitsProduct);
  if (exsitsProduct !== -1) {
    cart.items[exsitsProduct].quantity += 1;
    cart.items[exsitsProduct].totalePrice =
      cart.items[exsitsProduct].totalePrice +
      product.price * cart.items[exsitsProduct].quantity;
  } else {
    const newItem = {
      productId: productId,
      quantity: 1,
      totalePrice: product.price,
    };
    cart.items.push(newItem);
  }
  await user.save();
  res.status(200).json({
    message: "add to cart succsuflyy",
    cart: user.cart,
  });
};

exports.deleteCart = async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("no user found");
    err.status = 404;
    return next(err);
  }
  user.cart = {};
  await user.save();
  res.status(200).json({
    message: "cart deleted",
    cart: user.cart,
  });
};

exports.deleteFromCart = async (req, res, next) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error("no product found");
    err.status = 404;
    return next(err);
  }
  const userId = req.userId;
  const user = await User.findById(userId);
  cart = user.cart;
  const exsistsProductInCart = cart.items.findIndex((item) => {
    return item.productId.toString() === productId;
  });
  //console.log(exsistsProductInCart);
  if (exsistsProductInCart === -1) {
    const err = new Error("no product found in the cart");
    err.status = 404;
    return next(err);
  } else {
    cart.items.splice(exsistsProductInCart, 1);
    await user.save();
  }
  res.status(200).json({
    message: "the product is deleted from cart",
    cart: user.cart,
  });
};

exports.Postorder = (req, res, next) => {};
