var { Product, ProductCategory } = require("../../models/product");
var { Shop } = require("../../models/shop");

// Create Product
async function createProduct(req, res, next) {
  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    shop: req.query.shopID,
  });
  await newProduct.save();

  const productID = newProduct._id;

  // Add product to shop
  await Shop.findByIdAndUpdate(req.query.shopID, {
    $push: { products: productID },
  });

  // Add categories
  let categories = req.body.categories;
  categories = categories.match(/\w+/g);

  for (let i = 0; i < categories.length; i++) {
    const categoryID = categories[i];
    await addProductCategory(productID, categoryID);
  }

  // Add images
  if (req.files) {
    for (let i = 0; i < req.files.length; i++) {
      const image = req.files[i];
      const path = /(\/uploads)(.+)/g.exec(image.path)[0];
      await addProductImage(productID, path);
    }
  }

  res.json(newProduct);
}

// Show Product
async function showProduct(req, res, next) {
  res.json(
    await Product.findById(req.query.productID).populate("categories", "name"),
  );
}

// Update Product
async function updateProduct(req, res, next) {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.query.productID,
    {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    },
    { new: false },
  );

  if (req.body.categories) {
    // Remove old categories
    let oldCategories = updatedProduct.categories;
    for (let i = 0; i < oldCategories.length; i++) {
      const categoryID = oldCategories[i]._id;
      await removeProductCategory(req.query.productID, categoryID);
    }

    // Add new categories
    let newCategories = req.body.categories;
    newCategories = newCategories.match(/\w+/g);

    for (let i = 0; i < newCategories.length; i++) {
      const categoryID = newCategories[i];
      await addProductCategory(req.query.productID, categoryID);
    }
  }

  // Update images
  if (req.files && req.files.length !== 0) {
    // Remove product images
    await removeProductImages(req.query.productID);

    // Add product images
    for (let i = 0; i < req.files.length; i++) {
      const image = req.files[i];
      const path = /(\/uploads)(.+)/g.exec(image.path)[0];
      await addProductImage(req.query.productID, path);
    }
  }

  res.json(updatedProduct);
}

// Delete Product
async function deleteProduct(req, res, next) {
  const deletedProduct = await Product.findByIdAndDelete(req.query.productID);

  // Remove product from shop
  await Shop.findByIdAndUpdate(deletedProduct.shop._id, {
    $pull: { products: deletedProduct._id },
  });

  // Remove product from categories
  for (let i = 0; i < deletedProduct.categories.length; i++) {
    const categoryID = deletedProduct.categories[i];
    await ProductCategory.findByIdAndUpdate(categoryID, {
      $pull: { products: req.query.productID },
    });
  }
  res.send("Product Deleted!");
}

// Add product category
async function addProductCategory(productID, categoryID) {
  await Product.findByIdAndUpdate(productID, {
    $push: { categories: categoryID },
  });

  await ProductCategory.findByIdAndUpdate(categoryID, {
    $push: { products: productID },
  });
}

// Remove product category
async function removeProductCategory(productID, categoryID) {
  await Product.findByIdAndUpdate(productID, {
    $pull: { categories: categoryID },
  });

  await ProductCategory.findByIdAndUpdate(categoryID, {
    $pull: { products: productID },
  });
}

// Add product image
async function addProductImage(productID, path) {
  await Product.findByIdAndUpdate(productID, { $push: { images: path } });
}

// Remove product images
async function removeProductImages(productID) {
  await Product.findByIdAndUpdate(productID, { images: [] });
}

module.exports = {
  createProduct,
  showProduct,
  updateProduct,
  deleteProduct,
};
