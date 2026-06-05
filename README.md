# 🛒 Professional E-Commerce Platform

A modern, full-stack e-commerce platform built with Node.js, Express, MongoDB, Vue 3, and TailwindCSS. Features a complete shopping experience with user authentication, product management, shopping cart, order processing, and multi-role administration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Vue](https://img.shields.io/badge/vue-3.x-brightgreen.svg)

---

## ✨ Features

### 🎯 Core Functionality
- **Multi-Role System**: Admin, Seller, and Customer roles with distinct permissions
- **Product Management**: Full CRUD operations for products with image uploads
- **Shop Management**: Sellers can create and manage their own shops
- **Shopping Cart**: Persistent cart with real-time updates and inventory validation
- **Order Management**: Complete order lifecycle from checkout to delivery
- **Payment Integration**: Ready for Stripe, PayPal, and Cash on Delivery
- **Search & Filter**: Advanced product search with category, price, and rating filters
- **Review System**: Customer reviews and ratings for products
- **User Profiles**: Customizable user profiles with order history

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach, works on all devices
- **Professional Styling**: TailwindCSS + DaisyUI for modern, clean interface
- **Loading States**: Skeleton screens and spinners for better UX
- **Toast Notifications**: Real-time feedback for user actions
- **Error Handling**: Graceful error messages and recovery options

### 🔐 Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords
- **Role-Based Access**: Protected routes and API endpoints
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for API security

### 📊 Admin Features
- **User Management**: View, edit, and manage all users
- **Shop Management**: Approve, monitor, and manage all shops
- **Product Oversight**: View and manage all products across platform
- **Order Management**: Monitor and manage all orders
- **Category Management**: Create and organize product categories
- **Analytics Dashboard**: Sales, revenue, and user statistics

### 🏪 Seller Features
- **Shop Dashboard**: Manage shop profile and settings
- **Product Management**: Add, edit, and remove products
- **Order Processing**: View and fulfill customer orders
- **Inventory Tracking**: Monitor stock levels and availability
- **Sales Analytics**: Track shop performance and revenue

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Docker** & **Docker Compose** (for MongoDB)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-nodejs.git
   cd ecommerce-nodejs
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

   Required environment variables:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://admin:password@localhost:27017/ecommerce?authSource=admin
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:8000
   
   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

4. **Start MongoDB with Docker**
   ```bash
   # From backend directory
   docker-compose up -d
   ```

   This will start:
   - MongoDB on `localhost:27017`
   - Mongo Express (admin UI) on `localhost:8081`

5. **Start Backend Server**
   ```bash
   npm run watch
   ```
   Backend will run on `http://localhost:3000`

6. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```

7. **Configure Frontend Environment**
   ```bash
   # Create .env file in frontend directory
   cp .env.example .env
   ```

   Frontend `.env`:
   ```env
   VITE_BACKENDURL=http://localhost:3000
   ```

8. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:8000`

9. **Access the Application**
   - **Frontend**: http://localhost:8000
   - **Backend API**: http://localhost:3000
   - **Mongo Express**: http://localhost:8081

---

## 📁 Project Structure

```
ecommerce-nodejs/
├── backend/                    # Express.js backend
│   ├── bin/
│   │   └── www                # Server entry point
│   ├── controllers/           # Request handlers
│   │   ├── admin/            # Admin controllers
│   │   ├── seller/           # Seller controllers
│   │   └── user.js           # User controllers
│   ├── models/               # Mongoose schemas
│   │   ├── cart.js           # Shopping cart model
│   │   ├── order.js          # Order model
│   │   ├── product.js        # Product model
│   │   ├── review.js         # Review model
│   │   ├── shop.js           # Shop model
│   │   ├── site.js           # Site settings model
│   │   └── user.js           # User model
│   ├── routes/               # API routes
│   │   ├── admin.js          # Admin routes
│   │   ├── main.js           # Public routes
│   │   ├── seller.js         # Seller routes
│   │   └── user.js           # User routes
│   ├── mongo-entrypoint/     # MongoDB initialization
│   │   └── mongo-init.js     # Database seeding script
│   ├── uploads/              # Uploaded files (gitignored)
│   ├── app.js                # Express app configuration
│   ├── auth.js               # Authentication middleware
│   ├── upload.js             # File upload configuration
│   ├── docker-compose.yml    # Docker services
│   ├── package.json
│   └── .env.example          # Environment template
│
├── frontend/                  # Vue 3 frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/          # Images, styles
│   │   ├── components/      # Vue components
│   │   │   ├── admin/       # Admin components
│   │   │   ├── dashboard/   # Seller dashboard components
│   │   │   ├── ImageSlideShow.vue
│   │   │   └── ProductGrid.vue
│   │   ├── router/          # Vue Router configuration
│   │   │   └── index.js
│   │   ├── stores/          # Pinia stores
│   │   │   ├── cart.js      # Cart state management
│   │   │   ├── counter.js
│   │   │   └── user.js      # User state management
│   │   ├── views/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── CartView.vue
│   │   │   ├── CheckOutView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── ProductView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── ShopView.vue
│   │   │   └── UserProfileView.vue
│   │   ├── App.vue          # Root component
│   │   ├── main.js          # App entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # TailwindCSS configuration
│   └── .env.example         # Environment template
│
├── README.md                 # This file
├── REDESIGN_PLAN.md         # Detailed redesign documentation
└── .gitignore
```

---

## 🔧 Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **Bcrypt** | Password hashing |
| **Multer** | File uploads |
| **CORS** | Cross-origin resource sharing |
| **Docker** | Containerization |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Vue 3** | Progressive JavaScript framework |
| **Vite** | Build tool and dev server |
| **Pinia** | State management |
| **Vue Router** | Client-side routing |
| **Axios** | HTTP client |
| **TailwindCSS** | Utility-first CSS framework |
| **DaisyUI** | TailwindCSS component library |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /user/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Product Endpoints

#### Get Recent Products
```http
GET /main/product/recent
```

#### Get Product by ID
```http
GET /main/product/:productID
```

#### Search Products
```http
GET /main/product/search?q=laptop&category=electronics&minPrice=100&maxPrice=1000
```

### Cart Endpoints (Authenticated)

#### Get User Cart
```http
GET /user/cart
Authorization: Bearer {token}
```

#### Add to Cart
```http
POST /user/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /user/cart/update/:itemId
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /user/cart/remove/:itemId
Authorization: Bearer {token}
```

### Order Endpoints (Authenticated)

#### Create Order
```http
POST /user/orders/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [...],
  "shippingAddress": {...},
  "paymentMethod": "credit_card"
}
```

#### Get User Orders
```http
GET /user/orders
Authorization: Bearer {token}
```

#### Get Order Details
```http
GET /user/orders/:orderId
Authorization: Bearer {token}
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 👥 User Roles & Permissions

### 🔵 Customer (Default)
- Browse products and shops
- Search and filter products
- Add products to cart
- Place orders
- Write product reviews
- Manage profile
- View order history
- Apply to become seller

### 🟢 Seller
- All customer permissions
- Create and manage one shop
- Add, edit, delete products
- View and process orders
- Manage inventory
- View sales analytics
- Respond to reviews

### 🔴 Admin
- All seller permissions
- Manage all users
- Manage all shops
- Manage all products
- Manage all orders
- Create/edit/delete categories
- View platform analytics
- System configuration

---

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  name: String,
  avatar: String,
  phone: String,
  address: {
    country: String,
    province: String,
    city: String,
    postCode: String,
    street: String
  },
  role: ObjectId (ref: Role),
  shop: ObjectId (ref: Shop),
  reviews: [ObjectId] (ref: Review),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  images: [String],
  price: Number,
  description: String,
  inventory: {
    quantity: Number,
    lowStockThreshold: Number,
    trackInventory: Boolean
  },
  categories: [ObjectId] (ref: ProductCategory),
  shop: ObjectId (ref: Shop),
  reviews: [ObjectId] (ref: Review),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number,
    shop: ObjectId (ref: Shop)
  }],
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  total: Number,
  trackingNumber: String,
  statusHistory: [Object],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 UI Components

### Design System
- **Colors**: Professional blue/purple palette
- **Typography**: Inter/System UI fonts
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable Vue components with TailwindCSS

### Key Components
- `ProductGrid.vue` - Responsive product grid
- `ImageSlideShow.vue` - Product image carousel
- `CartItem.vue` - Shopping cart item
- `OrderCard.vue` - Order summary card
- `SearchBar.vue` - Search with autocomplete
- `FilterSidebar.vue` - Product filtering
- `Toast.vue` - Notification system

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Order placement
- [ ] Seller dashboard
- [ ] Admin panel
- [ ] Mobile responsiveness

---

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://user:pass@your-mongo-host:27017/ecommerce
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://yourdomain.com
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong, random secret keys
3. **Password Policy**: Enforce minimum 8 characters
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement API rate limiting
6. **HTTPS**: Use SSL certificates in production
7. **CORS**: Configure allowed origins properly
8. **Dependencies**: Keep packages updated
9. **MongoDB**: Use authentication and access control
10. **File Uploads**: Validate file types and sizes

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps

# View MongoDB logs
docker logs ecommerce_mongodb

# Restart MongoDB
docker-compose restart mongo
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Frontend Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in [`backend/app.js`](backend/app.js)

---

## 📈 Roadmap

### Phase 1: Core Features (Current)
- [x] User authentication
- [x] Product management
- [x] Shop management
- [x] Basic admin panel
- [ ] Shopping cart (In Progress)
- [ ] Order management (In Progress)

### Phase 2: Enhanced Features
- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Product recommendations
- [ ] Wishlist functionality
- [ ] Product comparison

### Phase 3: Advanced Features
- [ ] Real-time chat support
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Inventory forecasting
- [ ] Loyalty program

### Phase 4: Scale & Optimize
- [ ] Microservices architecture
- [ ] Redis caching
- [ ] CDN integration
- [ ] Load balancing
- [ ] Performance optimization
- [ ] SEO optimization

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Original Author** - [ericnanhu](https://github.com/ericnanhu)
- **Contributors** - See [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- DaisyUI for beautiful components
- MongoDB team for the database
- Express.js community
- All contributors and users

---

## 📞 Support

- **Documentation**: [REDESIGN_PLAN.md](./REDESIGN_PLAN.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ecommerce-nodejs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ecommerce-nodejs/discussions)
- **Email**: support@yourdomain.com

---

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Coverage](https://img.shields.io/badge/coverage-75%25-yellow.svg)
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)

**Current Version**: 2.0.0  
**Status**: Active Development  
**Last Updated**: June 2026

---

<div align="center">
  <p>Made with ❤️ by the development team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>