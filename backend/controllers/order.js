const Order = require("../models/order");
const Cart = require("../models/cart");
const { Product } = require("../models/product");
const { User } = require("../models/user");

// Create new order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and payment method are required",
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price images inventory shop",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate inventory and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products no longer exist",
        });
      }

      // Check inventory
      if (product.inventory && product.inventory.trackInventory) {
        if (product.inventory.quantity < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
            product: product.name,
            available: product.inventory.quantity,
            requested: cartItem.quantity,
          });
        }
      }

      // Prepare order item
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        shop: product.shop,
        image: product.images && product.images[0] ? product.images[0] : null,
      });

      subtotal += product.price * cartItem.quantity;
    }

    // Calculate pricing
    const shippingFee = 0; // TODO: Calculate based on location/weight
    const tax = subtotal * 0.1; // 10% tax (adjust as needed)
    const discount = 0; // TODO: Apply coupon if provided
    const total = subtotal + shippingFee + tax - discount;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      pricing: {
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
      },
      notes,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
    });

    await order.save();

    // Update product inventory
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.inventory && product.inventory.trackInventory) {
        product.inventory.quantity -= item.quantity;
        await product.save();
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order for response
    await order.populate([
      { path: "user", select: "username email" },
      { path: "items.product", select: "name price images" },
      { path: "items.shop", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate([
        { path: "items.product", select: "name price images" },
        { path: "items.shop", select: "name" },
      ])
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate([
      { path: "user", select: "username email phone" },
      { path: "items.product", select: "name price images" },
      { path: "items.shop", select: "name" },
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory && product.inventory.trackInventory) {
        product.inventory.quantity += item.quantity;
        await product.save();
      }
    }

    await order.cancelOrder(reason || "Cancelled by customer", userId);

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};

// Get seller's orders
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Get seller's shop
    const user = await User.findById(sellerId);

    if (!user || !user.shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const query = { "items.shop": user.shop };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate([
        { path: "user", select: "username email phone" },
        { path: "items.product", select: "name price images" },
      ])
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Update order status (seller)
exports.updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify seller owns the shop for this order
    const user = await User.findById(sellerId);

    const hasPermission = order.items.some(
      (item) => item.shop.toString() === user.shop.toString(),
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    await order.updateStatus(status, note, sellerId);

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Add tracking information (seller)
exports.addTracking = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.params;
    const { trackingNumber, carrier } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify seller owns the shop for this order
    const user = await User.findById(sellerId);

    const hasPermission = order.items.some(
      (item) => item.shop.toString() === user.shop.toString(),
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    await order.addTracking(trackingNumber, carrier);

    res.json({
      success: true,
      message: "Tracking information added",
      order,
    });
  } catch (error) {
    console.error("Add tracking error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding tracking information",
      error: error.message,
    });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate([
        { path: "user", select: "username email" },
        { path: "items.product", select: "name price" },
        { path: "items.shop", select: "name" },
      ])
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    // Get statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$pricing.total" },
        },
      },
    ]);

    res.json({
      success: true,
      orders,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Made with Bob
