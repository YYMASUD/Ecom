# 🛒 Marketplace — Full-Stack Node.js E-Commerce App

A **pure Node.js** e-commerce marketplace with a **Vue 3** frontend. Works completely **offline** — no external database needed for local development. Data is auto-seeded in an in-memory MongoDB on every start.

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
| ⚙️ **Admin Panel** | User / shop / product / review management |
| 🔔 **Toast Notifications** | Slide-in from right edge, coloured by type |
| 🗄️ **Zero-config DB** | In-memory MongoDB, no install needed |
| 📝 **Reviews** | Product review system |

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
npm start
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
├── backend/                        # Express + Node.js API
│   ├── server.js                   # Entry point — starts server + in-memory MongoDB
│   ├── app.js                      # Express app config + middleware
│   ├── auth.js                     # JWT authentication middleware
│   ├── upload.js                   # Multer file upload config
│   ├── package.json
│   ├── .env.example
│   ├── controllers/
│   │   ├── index.js                # Public controllers (products, categories, shops, search)
│   │   ├── cart.js                 # Cart CRUD
│   │   ├── order.js                # Order management
│   │   ├── user.js                 # User profile
│   │   ├── seller/
│   │   │   ├── product.js          # Seller product CRUD
│   │   │   ├── review.js           # Seller review management
│   │   │   └── shop.js             # Seller shop management
│   │   └── admin/
│   │       ├── product.js          # Admin product management
│   │       ├── review.js           # Admin review moderation
│   │       ├── shop.js             # Admin shop management
│   │       ├── site.js             # Admin site settings
│   │       └── user.js             # Admin user management
│   ├── models/
│   │   ├── product.js
│   │   ├── category.js
│   │   ├── shop.js
│   │   ├── user.js
│   │   ├── review.js
│   │   ├── site.js
│   │   ├── cart.js
│   │   └── order.js
│   ├── routes/
│   │   ├── main.js                 # Public API routes
│   │   ├── user.js                 # Auth routes
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── seller.js
│   │   └── admin.js
│   └── scripts/
│       ├── seedDemo.js             # Seeds 50 products, 10 categories, 5 shops, 3 users
│       └── seedRoles.js            # Seeds roles (admin/seller/customer)
│
└── frontend/                       # Vue 3 + Vite + Tailwind CSS + DaisyUI
    ├── index.html
    ├── serve.js                    # Static file server for production build
    ├── vite.config.js
    ├── tailwind.config.js
    ├── public/
    │   └── manifest.json           # PWA manifest
    └── src/
        ├── main.js
        ├── App.vue                 # Root component — navbar, footer, mobile bottom nav
        ├── index.css               # Tailwind base styles
        ├── router/
        │   └── index.js            # All routes incl. 404 catch-all
        ├── stores/                 # Pinia stores
        │   ├── user.js             # Auth state + JWT
        │   ├── cart.js             # Cart state (local + backend sync)
        │   └── notification.js     # Toast notification queue
        ├── components/
        │   ├── SearchBar.vue       # Live dropdown search (debounced, backend-connected)
        │   ├── ProductGrid.vue     # Responsive product card grid
        │   ├── ImageSlideShow.vue  # Hero image carousel
        │   ├── ToastNotification.vue # Slide-in toast from right edge
        │   ├── admin/              # Admin-specific components
        │   └── dashboard/          # Seller dashboard components
        ├── utils/
        │   └── categoryIcons.js    # 80+ category name → emoji mappings
        └── views/
            ├── HomeView.vue        # Hero carousel + featured products + shops
            ├── ProductsView.vue    # All products — filter, sort, paginate
            ├── ProductView.vue     # Single product detail + reviews
            ├── CategoriesView.vue  # All categories with sample images
            ├── CategoryView.vue    # Products filtered by category
            ├── ShopsView.vue       # All shops listing
            ├── ShopView.vue        # Single shop storefront
            ├── SearchView.vue      # Full-text search results
            ├── CartView.vue        # Shopping cart
            ├── CheckOutView.vue    # Checkout flow
            ├── LoginView.vue
            ├── RegisterView.vue
            ├── UserProfileView.vue
            ├── OrderHistoryView.vue
            ├── OrderDetailView.vue
            ├── DashboardView.vue   # Seller dashboard
            └── admin/              # Admin panel views
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
| DELETE | `/cart/clear` | Clear entire cart |
| POST | `/cart/sync` | Sync local cart with backend |

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
| GET | `/seller/review` | Get product reviews |

### Admin (`/admin`) — *requires Admin role*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/user/list` | All users |
| GET | `/admin/shop/list` | All shops |
| GET | `/admin/product/list` | All products |
| GET | `/admin/review/list` | All reviews |
| GET | `/admin/site` | Site settings |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server + DB status |

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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# MongoDB (optional — leave blank to use in-memory demo mode)
MONGODB_URI=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8000

# File uploads
PUBLIC_DIR=./public
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
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
| `/product/:id` | Product detail + reviews |
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
| **Frontend framework** | Vue 3 (Options API) |
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
- Mobile-first viewport meta tag (prevents zoom on input focus on iOS)

---

## 🖥️ Available Scripts

### Backend
```bash
cd backend
npm start        # Start server (production)
npm run dev      # Start server (development)
npm run watch    # Start with auto-reload on file changes
```

### Frontend
```bash
cd frontend
npx vite dev --port 8000   # Dev server with hot reload
npx vite build             # Build for production → dist/
node serve.js              # Serve production build
```

---

## ☁️ Deploy to Vercel

### Prerequisites
- [Vercel account](https://vercel.com) (free)
- [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster (for the database)

### 1. Set up MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user with read/write access
3. Whitelist all IPs: `0.0.0.0/0` (Network Access)
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/marketplace`

### 2. Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B — Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repo: `cnmasud/Ecommerce_Nodejs`
3. Vercel auto-detects `vercel.json` — no extra config needed

### 3. Set Environment Variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/marketplace` |
| `JWT_SECRET` | Any long random string (min 32 chars) |
| `NODE_ENV` | `production` |

### 4. Redeploy

After adding env vars, trigger a redeploy:
```bash
vercel --prod
```

### How it works on Vercel

```
Vercel Project
├── /api/index.js        → Serverless function (Express API)
│     ├── /main/*        → Products, categories, shops
│     ├── /user/*        → Auth (register, login)
│     ├── /cart/*        → Cart management
│     ├── /order/*       → Orders
│     ├── /seller/*      → Seller dashboard API
│     ├── /admin/*       → Admin API
│     └── /health        → Health check
└── frontend/dist/       → Vue 3 SPA (static files)
      └── /*             → All other routes → index.html
```

> **Note:** File uploads (`/uploads`) are not persisted on Vercel (serverless = no filesystem).
> Use a cloud storage service (Cloudinary, AWS S3) for production file uploads.

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