const fs = require("fs");
const path = require("path");

const Product = require("../models/product");
const User = require("../models/user");

exports.createProduct = async (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const type = req.body.type;
  const quantity = req.body.quantity;
  const colors = req.body.colors;
  const images = req.files.map((file) => file.path);

  //console.log(images);

  try {
    const exsitsProduct = await Product.findOne({ name: name });
    if (exsitsProduct) {
      const error = new Error("the product is aleardy exsits");
      error.status = 400;
      return next(error);
    }

    const product = new Product({
      name: name,
      type: type,
      price: price,
      quantity: quantity,
      imageUrl: images,
      colors: colors,
    });

    await product.save();
    res.status(201).json({
      message: "product add succsufly",
      product: product,
    });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

exports.editProduct = (req, res, next) => {};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("no product found");
      error.status = 404;
      return next(error);
    }
    product.imageUrl.forEach((path) => {
      clearImage(path);
    });
    await Product.findByIdAndRemove(productId);
    res.status(200).json({
      message: "the product is deleted",
    });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
