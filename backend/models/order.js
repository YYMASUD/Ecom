var mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String, // Snapshot of product name
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        shop: {
          type: Schema.Types.ObjectId,
          ref: "Shop",
          index: true,
        },
        image: String, // Snapshot of product image
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: String,
      postCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      fullName: String,
      address: String,
      city: String,
      province: String,
      postCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "cod", "bank_transfer"],
      required: true,
    },
    paymentDetails: {
      transactionId: String,
      paymentGateway: String,
      last4: String, // Last 4 digits of card
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
      index: true,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    couponCode: String,
    notes: String,
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    cancelReason: String,
    refundAmount: Number,
    refundReason: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Compound indexes for common queries
orderSchema.index({ user: 1, created_at: -1 });
orderSchema.index({ orderStatus: 1, created_at: -1 });
orderSchema.index({ "items.shop": 1, orderStatus: 1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }

  // Add to status history if status changed
  if (this.isModified("orderStatus")) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }

  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus, note, updatedBy) {
  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || "",
    updatedBy: updatedBy || null,
  });
  return this.save();
};

// Method to add tracking information
orderSchema.methods.addTracking = function (trackingNumber, carrier) {
  this.trackingNumber = trackingNumber;
  this.carrier = carrier;
  if (this.orderStatus === "confirmed" || this.orderStatus === "processing") {
    this.orderStatus = "shipped";
    this.statusHistory.push({
      status: "shipped",
      timestamp: new Date(),
      note: `Tracking number: ${trackingNumber}`,
    });
  }
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function (reason, cancelledBy) {
  this.orderStatus = "cancelled";
  this.cancelReason = reason;
  this.statusHistory.push({
    status: "cancelled",
    timestamp: new Date(),
    note: reason,
    updatedBy: cancelledBy,
  });
  return this.save();
};

// Virtual for order age in days
orderSchema.virtual("orderAge").get(function () {
  const now = new Date();
  const created = new Date(this.created_at);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included in JSON
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

// Made with Bob
