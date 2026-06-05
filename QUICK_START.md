# 🚀 Quick Start Guide

Get your e-commerce platform up and running in minutes!

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (v8 or higher) - Comes with Node.js
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **MongoDB Atlas Account** (Already configured in this project)

---

## 🎯 5-Minute Setup

### Step 1: Clone & Install

```bash
# Navigate to your project directory
cd d:/Code/androdevtraining

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Verify Environment Files

The `.env` files are already configured with MongoDB Atlas connection!

**Backend** (`backend/.env`):
```env
✅ MongoDB Atlas connected
✅ JWT secret configured
✅ CORS enabled for localhost:8000
```

**Frontend** (`frontend/.env`):
```env
✅ Backend URL: http://localhost:3000
✅ App configuration ready
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run watch
```
✅ Backend running on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on `http://localhost:8000`

### Step 4: Open Your Browser

Navigate to: **http://localhost:8000**

🎉 **You're ready to go!**

---

## 🧪 Test the Features

### 1. Shopping Cart
- Browse products (if any exist)
- Add items to cart
- Go to `/cart` to view your cart
- Update quantities
- Remove items

### 2. Checkout Process
- Click "Proceed to Checkout" from cart
- Complete the 4-step checkout:
  1. Review cart items
  2. Enter shipping information
  3. Select payment method
  4. Review and place order

### 3. Order Management
- View order history at `/orders`
- Filter orders by status
- Click on an order to see details
- Cancel orders (if eligible)
- Track shipments

### 4. User Features
- Register a new account at `/register`
- Login at `/login`
- View profile at `/profile`
- Access "My Orders" from user menu

---

## 📱 Available Routes

### Public Routes
- `/` - Homepage
- `/login` - User login
- `/register` - User registration
- `/product/:id` - Product details
- `/shop/:id` - Shop page
- `/category/:id` - Category page

### User Routes (Requires Login)
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/orders` - Order history
- `/order/:id` - Order details
- `/profile` - User profile

### Seller Routes
- `/dashboard` - Seller dashboard

### Admin Routes
- `/admin` - Admin panel
- `/admin/users` - User management
- `/admin/shops` - Shop management
- `/admin/products` - Product management

---

## 🔑 API Endpoints

### Cart APIs
```
GET    /cart                    - Get user's cart
POST   /cart/add                - Add item to cart
PUT    /cart/update/:productId  - Update quantity
DELETE /cart/remove/:productId  - Remove item
DELETE /cart/clear              - Clear cart
POST   /cart/sync               - Sync localStorage cart
```

### Order APIs
```
POST   /order/create            - Create order
GET    /order                   - Get user's orders
GET    /order/:orderId          - Get order details
PUT    /order/:orderId/cancel   - Cancel order
```

### Seller Order APIs
```
GET    /order/seller/orders              - Get seller's orders
PUT    /order/seller/:orderId/status     - Update order status
PUT    /order/seller/:orderId/tracking   - Add tracking info
```

### Admin Order APIs
```
GET    /order/admin/all         - Get all orders
```

---

## 🎨 UI Components

### Toast Notifications
```javascript
import { useNotificationStore } from '@/stores/notification'

const notification = useNotificationStore()

// Show notifications
notification.success('Order placed successfully!')
notification.error('Failed to add item')
notification.warning('Cart is empty')
notification.info('Free shipping on orders over $50')
notification.loading('Processing order...')
```

### Cart Store
```javascript
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

// Cart operations
await cart.addToCart(product, quantity)
await cart.updateQuantity(productId, newQuantity)
await cart.removeFromCart(productId)
await cart.clearCart()

// Cart data
cart.itemCount    // Total items
cart.subtotal     // Total price
cart.cartItems    // All items
cart.isEmpty      // Check if empty
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart backend
cd backend
npm run watch
```

### Frontend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB Connection Issues
The project is already connected to MongoDB Atlas. If you see connection errors:

1. Check your internet connection
2. Verify the MongoDB Atlas cluster is running
3. Check the connection string in `backend/.env`

### CORS Errors
If you see CORS errors in the browser console:

1. Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL
2. Restart the backend server
3. Clear browser cache

### Cart not persisting
- **Logged out users**: Cart is saved in localStorage
- **Logged in users**: Cart is saved in MongoDB
- Cart syncs automatically when you log in

---

## 📚 Project Structure

```
androdevtraining/
├── backend/
│   ├── models/          # Database models
│   │   ├── cart.js      # Cart model
│   │   ├── order.js     # Order model
│   │   ├── product.js   # Product model
│   │   └── user.js      # User model
│   ├── controllers/     # Request handlers
│   │   ├── cart.js      # Cart operations
│   │   └── order.js     # Order operations
│   ├── routes/          # API routes
│   │   ├── cart.js      # Cart routes
│   │   └── order.js     # Order routes
│   ├── .env             # Environment variables
│   └── app.js           # Express app
│
├── frontend/
│   ├── src/
│   │   ├── views/       # Page components
│   │   │   ├── CartView.vue
│   │   │   ├── CheckOutView.vue
│   │   │   ├── OrderHistoryView.vue
│   │   │   └── OrderDetailView.vue
│   │   ├── stores/      # Pinia stores
│   │   │   ├── cart.js
│   │   │   └── notification.js
│   │   ├── components/  # Reusable components
│   │   │   └── ToastNotification.vue
│   │   └── router/      # Vue Router
│   ├── .env             # Environment variables
│   └── package.json
│
└── Documentation/
    ├── README.md                  # Main documentation
    ├── REDESIGN_PLAN.md          # Implementation plan
    ├── ENVIRONMENT_SETUP.md      # Environment guide
    ├── MONGODB_SETUP.md          # Database guide
    ├── IMPLEMENTATION_SUMMARY.md # Feature summary
    └── QUICK_START.md            # This file
```

---

## 🎓 Learning Resources

### Vue 3
- [Official Documentation](https://vuejs.org/)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia State Management](https://pinia.vuejs.org/)

### TailwindCSS & DaisyUI
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)

### Backend
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

## 🔄 Development Workflow

### Making Changes

1. **Backend Changes**:
   ```bash
   cd backend
   # Edit files in models/, controllers/, or routes/
   # Server auto-restarts with npm-watch
   ```

2. **Frontend Changes**:
   ```bash
   cd frontend
   # Edit files in src/
   # Hot reload is automatic with Vite
   ```

3. **Database Changes**:
   - Models are in `backend/models/`
   - MongoDB Atlas is the database
   - Use MongoDB Compass to view data

### Testing

```bash
# Test backend API with curl or Postman
curl http://localhost:3000/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test frontend
# Open http://localhost:8000 in browser
# Use browser DevTools to debug
```

---

## 🚀 Next Steps

Now that you're up and running:

1. ✅ **Test the cart system** - Add, update, remove items
2. ✅ **Complete a checkout** - Place a test order
3. ✅ **View order history** - Check your orders
4. 📝 **Add products** - Create products to sell
5. 🎨 **Customize UI** - Modify TailwindCSS styles
6. 🔧 **Add features** - Implement search, filters, etc.

---

## 💡 Pro Tips

### Development
- Use **Vue DevTools** browser extension for debugging
- Use **MongoDB Compass** to view database
- Use **Postman** or **Thunder Client** for API testing
- Enable **ESLint** in your editor for code quality

### Performance
- Cart operations are optimized with Pinia
- Images should be optimized before upload
- Use lazy loading for routes (already implemented)
- MongoDB indexes are configured for fast queries

### Security
- Never commit `.env` files
- Use strong JWT secrets in production
- Validate all user inputs
- Use HTTPS in production

---

## 📞 Need Help?

- 📖 **Documentation**: Check the other `.md` files in the project
- 🐛 **Issues**: Common problems are in the Troubleshooting section
- 💬 **Questions**: Review the comprehensive documentation files

---

## ✨ Features Ready to Use

✅ Shopping Cart (add, update, remove, clear)
✅ Cart Persistence (localStorage + MongoDB)
✅ Checkout Flow (4 steps with validation)
✅ Order Management (create, view, cancel)
✅ Order History (filter, search, paginate)
✅ Order Details (timeline, tracking, invoice)
✅ Toast Notifications (5 types)
✅ Loading States (everywhere)
✅ Error Handling (comprehensive)
✅ Responsive Design (mobile-first)
✅ Role-Based Access (user, seller, admin)

---

<div align="center">
  <h3>🎉 Happy Coding! 🎉</h3>
  <p>Your e-commerce platform is ready for development!</p>
</div>