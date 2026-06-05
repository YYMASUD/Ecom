var { Site } = require("../models/site");
var { Product, ProductCategory } = require("../models/product");
var { Review } = require("../models/review");
var { Shop } = require("../models/shop");
var { User } = require("../models/user");

// Retrieve website information
async function showSite(req, res, next) {
  res.json(await Site.find({}));
}

// Retrieve all product categories
async function listAllCategories(req, res, next) {
  res.json(await ProductCategory.find({}));
}

// Retrieve recently created products
async function listRecentProducts(req, res, next) {
  res.json(await Product.find({}).sort({ created_at: -1 }).limit(15));
}

// Retrieve recently created shops
async function listRecentShops(req, res, next) {
  res.json(await Shop.find({}).sort({ created_at: -1 }).limit(15));
}

// Retrieve one single product category
async function showCategory(req, res, next) {
  res.json(
    await ProductCategory.findById(req.query.categoryID).populate("products"),
  );
}

// Retrieve one single shop
async function showShop(req, res, next) {
  res.json(await Shop.findById(req.query.shopID).populate("products"));
}

// Retrieve one single product
async function showProduct(req, res, next) {
  res.json(await Product.findById(req.query.productID).populate("reviews"));
}

// Add review to a product
async function addProductReview(req, res, next) {
  const product = await Product.findById(req.query.productID);
  const user = await User.findById(req.query.userID);
  const newReview = new Review({
    rating: req.body.rating,
    content: req.body.content,
    product: product,
    user: user,
  });
  await newReview.save();

  // update product
  await Product.findByIdAndUpdate(req.query.productID, {
    $push: { reviews: newReview },
  });

  // update user
  await User.findByIdAndUpdate(req.query.userID, {
    $push: { reviews: newReview },
  });

  res.json(newReview);
}

//  Remove product review
async function removeProductReview(req, res, next) {
  const review = await Review.findByIdAndDelete(req.query.reviewID);

  // update product
  await Product.findByIdAndUpdate(review.product._id, {
    $pull: { reviews: review._id },
  });

  // update user
  await User.findByIdAndUpdate(review.user._id, {
    $pull: { reviews: review._id },
  });

  res.json(review);
}

module.exports = {
  showSite,
  listAllCategories,
  listRecentProducts,
  listRecentShops,
  showCategory,
  showShop,
  showProduct,
  addProductReview,
  removeProductReview,
};
