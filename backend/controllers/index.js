var { Site } = require("../models/site");
var { Product, ProductCategory } = require("../models/product");
var { Review } = require("../models/review");
var { Shop } = require("../models/shop");
var { User } = require("../models/user");

// Retrieve website information
async function showSite(req, res, next) {
  try {
    const sites = await Site.find({});
    res.json(sites);
  } catch (err) {
    next(err);
  }
}

// Retrieve all product categories — includes real productCount via aggregation
async function listAllCategories(req, res, next) {
  try {
    const categories = await ProductCategory.aggregate([
      {
        $project: {
          name: 1,
          products: 1,
          created_at: 1,
          productCount: { $size: { $ifNull: ['$products', []] } },
        },
      },
      { $sort: { name: 1 } },
    ]);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

// Retrieve recently created products (up to 100, with category refs)
async function listRecentProducts(req, res, next) {
  try {
    const products = await Product
      .find({})
      .populate('categories', '_id name')
      .sort({ created_at: -1 })
      .limit(100);
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// Retrieve recently created shops (up to 20)
async function listRecentShops(req, res, next) {
  try {
    const shops = await Shop.find({}).sort({ created_at: -1 }).limit(20);
    res.json(shops);
  } catch (err) {
    next(err);
  }
}

// Search products by name or description
async function searchProducts(req, res, next) {
  try {
    const { q = '', limit = 10, page = 1 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
      ],
    })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ created_at: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
}

// Retrieve one single product category with fully populated products
async function showCategory(req, res, next) {
  try {
    if (!req.query.categoryID) {
      return res.status(400).json({ success: false, message: "categoryID is required" });
    }
    const category = await ProductCategory
      .findById(req.query.categoryID)
      .populate({
        path: 'products',
        options: { sort: { created_at: -1 } },
      });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    // Attach productCount for convenience
    const result = category.toObject();
    result.productCount = result.products ? result.products.length : 0;
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Retrieve one single shop
async function showShop(req, res, next) {
  try {
    if (!req.query.shopID) {
      return res.status(400).json({ success: false, message: "shopID is required" });
    }
    const shop = await Shop.findById(req.query.shopID).populate("products");
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }
    res.json(shop);
  } catch (err) {
    next(err);
  }
}

// Retrieve one single product
async function showProduct(req, res, next) {
  try {
    if (!req.query.productID) {
      return res.status(400).json({ success: false, message: "productID is required" });
    }
    const product = await Product.findById(req.query.productID).populate("reviews");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// Add review to a product
async function addProductReview(req, res, next) {
  try {
    const { productID, userID } = req.query;
    const { rating, content } = req.body;

    if (!productID || !userID) {
      return res.status(400).json({ success: false, message: "productID and userID are required" });
    }
    if (!rating || !content) {
      return res.status(400).json({ success: false, message: "rating and content are required" });
    }

    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newReview = new Review({
      rating,
      content,
      product: product._id,
      user: user._id,
    });
    await newReview.save();

    // update product
    await Product.findByIdAndUpdate(productID, {
      $push: { reviews: newReview._id },
    });

    // update user
    await User.findByIdAndUpdate(userID, {
      $push: { reviews: newReview._id },
    });

    res.json(newReview);
  } catch (err) {
    next(err);
  }
}

// Remove product review
async function removeProductReview(req, res, next) {
  try {
    const { reviewID } = req.query;
    if (!reviewID) {
      return res.status(400).json({ success: false, message: "reviewID is required" });
    }

    const review = await Review.findByIdAndDelete(reviewID);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // update product
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });

    // update user
    await User.findByIdAndUpdate(review.user, {
      $pull: { reviews: review._id },
    });

    res.json(review);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  showSite,
  listAllCategories,
  listRecentProducts,
  listRecentShops,
  searchProducts,
  showCategory,
  showShop,
  showProduct,
  addProductReview,
  removeProductReview,
};
