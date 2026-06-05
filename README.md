# 🛒 Marketplace — Full-Stack Node.js E-Commerce App

A **pure Node.js** e-commerce marketplace with a **Vue 3** frontend. Works completely **offline** — no external database needed. Data is auto-seeded in an in-memory MongoDB on every start.

---

## 📸 Features

| Feature | Details |
|---|---|
| 🛍️ **50 Demo Products** | Auto-seeded across 10 categories on startup |
| 📱 **Mobile-First Design** | Sticky header, bottom nav bar, 2-col product grid |
| 🖥️ **Desktop Layout** | Hero carousel, feature strip, full grids, newsletter |
| 🔍 **Live Search** | Debounced dropdown with product images + prices |
| 🏷️ **Category Icons** | 80+ keyword → emoji mappings per category |
| 🛒 **Cart System** | Add / update / remove items, persisted in session |
| 🔐 **Auth** | Register, login, JWT sessions (admin / seller / customer) |
| 🏪 **Shop Pages** | Per-seller storefronts with product listings |
| 📦 **Order History** | Full order tracking for customers |
| 🧑‍💼 **Seller Dashboard** | Product & shop management |
| ⚙️ **Admin Panel** | User / shop / product management |
| 🔔 **Toast Notifications** | Slide-in from right edge, coloured by type |
| 🗄️ **Zero-config DB** | In-memory MongoDB, no install needed |

---

## 🚀 Quick Start (No Database Required)

```bash
# 1. Clone
git clone https://github.com/cnmasud/Ecommerce_Nodejs.git
cd Ecommerce_Nodejs

# 2. Install backend dependencies
cd backend
npm install

# 3. Start the backend (auto-seeds 50 products)
node ./bin/www
# → http://localhost:3000

# 4. In a new terminal — install & start the frontend
cd ../frontend
npm install
npx vite dev --port 8000
# → http://localhost:8000
```

That's it. **No MongoDB Atlas account, no `.env` files, no Docker** needed for local development.

---

## 🔑 Demo Credentials

All accounts use password: **`demo1234`**

| Email | Role | Access |
|---|---|---|
| `admin@demo.com` | Admin | Full admin panel |
| `seller@demo.com` | Seller | Dashboard + shop management |
| `customer@demo.com` | Customer | Shopping, cart, orders |

---

## 📁 Project Structure

```
androdevtraining/
├── backend/                  # Express + Node.js API
│   ├── bin/www               # Entry point — starts server + in-memory MongoDB
│   ├── app.js                # Express app config + middleware
│   ├── auth.js               # JWT authentication middleware
│   ├── upload.js             # Multer file upload config
│   ├── package.json
│   ├── .env.example
│   ├── controllers/
│   │   ├── index.js          # Public controllers (products, categories, shops, search)
│   │   ├── cart.js           # Cart CRUD
│   │   ├── order.js          # Order management
│   │   ├── user.js           # User profile
│   │   ├── seller/
│   │   │   ├── product.js    # Seller product CRUD
│   │   │   └── shop.js       # Seller shop management
│   │   └── admin/            # Admin controllers
│   ├── models/
│   │   ├── product.js
│   │   ├── category.js
│   │   ├── shop.js
│   │   ├── user.js
│   │   ├── role.js
│   │   ├── cart.js
│   │   └── order.js
│   ├── routes/
│   │   ├── main.js           # Public API routes
│   │   ├── user.js           # Auth routes
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── seller.js
│   │   └── admin.js
│   └── scripts/
│       ├── seedDemo.js       # Seeds 50 products, 10 categories, 5 shops, 3 users
│       └── seedRoles.js      # Seeds roles (admin/seller/customer)
│
└── frontend/                 # Vue 3 + Vite + Tailwind CSS + DaisyUI
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── public/
    │   └── manifest.json     # PWA manifest
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/
        │   └── index.js      # All routes incl. 404 catch-all
        ├── stores/           # Pinia stores
        │   ├── user.js
        │   ├── cart.js
        │   └── notification.js
        ├── components/
        │   ├── SearchBar.vue         # Live dropdown search (debounced, backend-connected)
        │   ├── ProductGrid.vue       # Responsive product card grid
        │   ├── ToastNotification.vue # Slide-in toast from right edge
        │   └── ...
        ├── utils/
        │   └── categoryIcons.js      # 80+ category name → emoji mappings
        └── views/
            ├── HomeView.vue          # Hero carousel + featured products + shops
            ├── ProductsView.vue      # All products — filter, sort, paginate
            ├── ProductView.vue       # Single product detail
            ├── CategoriesView.vue    # All categories with sample images
            ├── CategoryView.vue      # Products filtered by category
            ├── ShopsView.vue         # All shops listing
            ├── ShopView.vue          # Single shop storefront
            ├── SearchView.vue        # Full-text search results
            ├── CartView.vue
            ├── CheckOutView.vue
            ├── LoginView.vue
            ├── RegisterView.vue
            ├── UserProfileView.vue
            ├── OrderHistoryView.vue
            ├── OrderDetailView.vue
            ├── DashboardView.vue
            └── admin/AdminView.vue
```

---

## 🌐 API Endpoints

### Public (`/main`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/main/product/recent` | All products |
| GET | `/main/product/show?productID=:id` | Single product |
| GET | `/main/product/search?q=:term` | Full-text search |
| GET | `/main/category/all` | All categories |
| GET | `/main/category/show?categoryID=:id` | Single category |
| GET | `/main/shop/recent` | All shops |
| GET | `/main/shop/show?shopID=:id` | Single shop |
| GET | `/main/site` | Site metadata |

### Auth (`/user`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/register` | Create account |
| POST | `/user/login` | Login → JWT token |
| GET | `/user/show?userID=:id` | Get user profile |

### Cart (`/cart`) — *requires login*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get cart |
| POST | `/cart/add` | Add item |
| PUT | `/cart/update/:productID` | Update quantity |
| DELETE | `/cart/remove/:productID` | Remove item |

### Orders (`/order`) — *requires login*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/order` | List orders |
| POST | `/order` | Create order |
| GET | `/order/:id` | Order detail |

### Seller (`/seller`) — *requires Seller role*
| Method | Endpoint | Description |
|---|---|---|
| POST | `/seller/product/add` | Add product |
| PUT | `/seller/product/update/:id` | Update product |
| DELETE | `/seller/product/delete/:id` | Delete product |
| POST | `/seller/shop/create` | Create shop |
| PUT | `/seller/shop/update` | Update shop |

### Admin (`/admin`) — *requires Admin role*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/user/list` | All users |
| GET | `/admin/shop/list` | All shops |
| GET | `/admin/product/list` | All products |

---

## 🗄️ Seeded Demo Data

| Collection | Count | Details |
|---|---|---|
| Products | **50** | 5 per category, with images + descriptions |
| Categories | **10** | Electronics, Clothing, Home & Garden, Sports, Books, Toys & Games, Beauty, Automotive, Food & Drink, Music |
| Shops | **5** | TechZone, FashionHub, HomeBliss, SportsWorld, BookNook |
| Users | **3** | Admin, Seller, Customer |
| Roles | **3** | admin, seller, customer |

> **Data resets on every backend restart** (in-memory MongoDB). See below to persist data.

---

## 🔧 Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_here

# MongoDB (optional — leave blank to use in-memory demo mode)
MONGODB_URI=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8000
```

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_BACKENDURL=http://localhost:3000
```

### To use a real MongoDB (persist data)

Set `MONGODB_URI` in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/marketplace
```

MongoDB Atlas free tier: https://www.mongodb.com/atlas

---

## 🛣️ Frontend Routes

| Route | Page |
|---|---|
| `/` | Home — hero + featured products + categories + shops |
| `/products` | All products (filter + sort + pagination) |
| `/product/:id` | Product detail |
| `/categories` | Category grid |
| `/category/:id` | Products in a category |
| `/shops` | All shops |
| `/shop/:id` | Shop storefront |
| `/search?q=…` | Search results |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/login` | Login |
| `/register` | Register |
| `/profile` | User profile |
| `/orders` | Order history |
| `/order/:id` | Order detail |
| `/dashboard` | Seller dashboard |
| `/admin` | Admin panel |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Backend framework** | Express 4 |
| **Database** | MongoDB via Mongoose |
| **In-memory DB** | mongodb-memory-server (dev/demo) |
| **Auth** | JWT + bcryptjs |
| **File uploads** | Multer |
| **Frontend framework** | Vue 3 (Composition API) |
| **Build tool** | Vite 2 |
| **Styling** | Tailwind CSS + DaisyUI |
| **State management** | Pinia |
| **HTTP client** | Axios |
| **Routing** | Vue Router 4 |

---

## 📱 Mobile Support

- Sticky header with hamburger menu
- Fixed bottom navigation bar (Home / Search / Cart / Orders / Account)
- 2-column product grid on mobile
- Touch-friendly cards and buttons
- Full-screen search overlay
- PWA manifest (`public/manifest.json`)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [cnmasud](https://github.com/cnmasud)
