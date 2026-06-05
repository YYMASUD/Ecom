var mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// TTL index to automatically delete expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for total items count
cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function (productId, quantity, price) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
    });
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(
        (item) => item.product.toString() !== productId.toString()
      );
    } else {
      item.quantity = quantity;
    }
  }

  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

// Ensure virtuals are included in JSON
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;

// Made with Bob
