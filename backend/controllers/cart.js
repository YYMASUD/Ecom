const Cart = require("../models/cart");
const { Product } = require("../models/product");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price images inventory",
      populate: {
        path: "shop",
        select: "name",
      },
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.json({
      success: true,
      cart: cart,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check inventory if tracking is enabled
    if (product.inventory && product.inventory.trackInventory) {
      if (product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
          availableQuantity: product.inventory.quantity,
        });
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check inventory for new quantity
      if (product.inventory && product.inventory.trackInventory) {
        if (product.inventory.quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock for requested quantity",
            availableQuantity: product.inventory.quantity,
            currentInCart: cart.items[existingItemIndex].quantity,
          });
        }
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: "items.product",
      select: "name price images inventory",
      populate: {
        path: "shop",
        select: "name",
      },
    });

    res.json({
      success: true,
      message: "Item added to cart",
      cart: cart,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Check inventory
      const product = await Product.findById(productId);
      if (product && product.inventory && product.inventory.trackInventory) {
        if (product.inventory.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock",
            availableQuantity: product.inventory.quantity,
          });
        }
      }

      // Update quantity and price
      cart.items[itemIndex].quantity = quantity;
      if (product) {
        cart.items[itemIndex].price = product.price;
      }
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: "items.product",
      select: "name price images inventory",
      populate: {
        path: "shop",
        select: "name",
      },
    });

    res.json({
      success: true,
      message: "Cart updated",
      cart: cart,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message,
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: "items.product",
      select: "name price images inventory",
      populate: {
        path: "shop",
        select: "name",
      },
    });

    res.json({
      success: true,
      message: "Item removed from cart",
      cart: cart,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared",
      cart: cart,
      itemCount: 0,
      subtotal: 0,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

// Sync cart (for when user logs in with items in localStorage)
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart items",
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Merge items from request with existing cart
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const existingItemIndex = cart.items.findIndex(
        (cartItem) => cartItem.product.toString() === item.productId,
      );

      if (existingItemIndex > -1) {
        // Update quantity (take the maximum)
        cart.items[existingItemIndex].quantity = Math.max(
          cart.items[existingItemIndex].quantity,
          item.quantity,
        );
        cart.items[existingItemIndex].price = product.price;
      } else {
        // Add new item
        cart.items.push({
          product: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: "items.product",
      select: "name price images inventory",
      populate: {
        path: "shop",
        select: "name",
      },
    });

    res.json({
      success: true,
      message: "Cart synced",
      cart: cart,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing cart",
      error: error.message,
    });
  }
};

// Made with Bob
