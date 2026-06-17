# 🛒 Marketplace — Full-Stack Node.js E-Commerce App

A **pure Node.js** e-commerce marketplace with a **Vue 3** frontend. Works completely **offline** — no external database needed for local development. Data is auto-seeded in an in-memory MongoDB on every start.

## 🌐 Live Demo

| | URL |
|---|---|
| **Frontend** | https://frontend-sepia-six-33.vercel.app |
| **Backend API** | https://androdevtraining.vercel.app |
| **Health Check** | https://androdevtraining.vercel.app/health |

> Demo credentials — all use password **`demo1234`**:  
> `admin@demo.com` · `seller@demo.com` · `customer@demo.com`

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
Ecommerce_Nodejs/
│
├── api/                            # ⚡ Vercel Serverless Entry Point
│   └── index.js                   # Connects MongoDB, auto-seeds, wraps Express app
│
├── vercel.json                     # Backend Vercel project config (routes /* → api/index)
├── package.json                    # Root deps for Vercel (bcryptjs, express, mongoose…)
│
├── backend/                        # Express + Node.js API
│   ├── server.js                   # Local dev entry point (in-memory MongoDB + seed)
│   ├── app.js                      # Express app — routes, middleware, CORS
│   ├── auth.js                     # JWT sign/verify + role guard middleware
│   ├── upload.js                   # Multer file upload config
│   ├── package.json                # Backend dependencies
│   ├── .env.example                # Environment variable template
│   ├── controllers/
│   │   ├── index.js                # Public: products, categories, shops, search
│   │   ├── cart.js                 # Cart CRUD
│   │   ├── order.js                # Order management
│   │   ├── user.js                 # Auth: register, login, profile
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
│   │   ├── product.js              # Product + ProductCategory schemas
│   │   ├── category.js
│   │   ├── shop.js
│   │   ├── user.js                 # User + Role schemas
│   │   ├── review.js
│   │   ├── site.js                 # Site metadata schema
│   │   ├── cart.js
│   │   └── order.js
│   ├── routes/
│   │   ├── main.js                 # Public API routes
│   │   ├── user.js                 # Auth routes (register, login)
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── seller.js               # Seller-only routes (role guard)
│   │   └── admin.js                # Admin-only routes (role guard)
│   └── scripts/
│       ├── seedDemo.js             # Seeds 50 products, 10 categories, 5 shops, 3 users
│       └── seedRoles.js            # Seeds roles (admin / seller / customer)
│
└── frontend/                       # Vue 3 + Vite + Tailwind CSS + DaisyUI
    ├── index.html
    ├── vercel.json                 # Frontend Vercel project config (SPA fallback)
    ├── serve.js                    # Static file server for local production preview
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example                # VITE_BACKENDURL=http://localhost:3000
    ├── .env.production             # VITE_BACKENDURL= (empty = same origin, set by Vercel)
    ├── public/
    │   └── manifest.json           # PWA manifest
    └── src/
        ├── main.js                 # App bootstrap — Vue, Pinia, Router
        ├── App.vue                 # Root: navbar, footer, mobile bottom nav, toasts
        ├── index.css               # Tailwind base styles
        ├── router/
        │   └── index.js            # All routes + 404 catch-all
        ├── stores/                 # Pinia state management
        │   ├── user.js             # Auth state + JWT token
        │   ├── cart.js             # Cart (local storage + backend sync)
        │   └── notification.js     # Toast notification queue
        ├── components/
        │   ├── SearchBar.vue       # Live debounced search dropdown
        │   ├── ProductGrid.vue     # Responsive product card grid
        │   ├── ImageSlideShow.vue  # Hero image carousel
        │   ├── ToastNotification.vue # Slide-in toast (right edge)
        │   ├── admin/              # Admin panel components
        │   └── dashboard/          # Seller dashboard components
        ├── utils/
        │   └── categoryIcons.js    # 80+ category name → emoji mappings
        └── views/
            ├── HomeView.vue        # Hero + featured products + categories + shops
            ├── ProductsView.vue    # All products (filter, sort, paginate)
            ├── ProductView.vue     # Single product detail + reviews
            ├── CategoriesView.vue  # Category grid with icons
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

## ☁️ Deploy to Vercel (Two Separate Projects)

This project deploys as **two separate Vercel projects** — one for the backend API and one for the frontend SPA.

### Prerequisites
- [Vercel account](https://vercel.com) (free)
- [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster
- Vercel CLI: `npm install -g vercel && vercel login`

---

### Step 1 — Set up MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user with read/write access
3. Whitelist all IPs: `0.0.0.0/0` (Network Access)
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/marketplace`

---

### Step 2 — Deploy the Backend

```bash
# From the project root
cd /path/to/Ecommerce_Nodejs

vercel --prod --yes
# → Creates project "androdevtraining" (or your chosen name)
# → Note the production URL, e.g. https://androdevtraining.vercel.app
```

Set environment variables on the backend project:
```bash
echo "mongodb+srv://user:pass@cluster.mongodb.net/marketplace" | vercel env add MONGODB_URI production --yes
echo "your-jwt-secret-min-32-chars" | vercel env add JWT_SECRET production --yes
echo "production" | vercel env add NODE_ENV production --yes

# Redeploy to apply env vars
vercel --prod --yes
```

---

### Step 3 — Deploy the Frontend

```bash
cd frontend

vercel --prod --yes
# → Creates project "frontend" (or your chosen name)
# → Note the production URL, e.g. https://frontend-xxx.vercel.app
```

Set the backend URL:
```bash
echo "https://androdevtraining.vercel.app" | vercel env add VITE_BACKENDURL production --yes

# Redeploy to bake the URL into the Vue build
vercel --prod --yes
```

---

### How it works

```
Vercel Project 1 — Backend (api/index.js)
  https://androdevtraining.vercel.app
  ├── /main/*     → Products, categories, shops
  ├── /user/*     → Auth (register, login)
  ├── /cart/*     → Cart management
  ├── /order/*    → Orders
  ├── /seller/*   → Seller dashboard API
  ├── /admin/*    → Admin API
  └── /health     → Health check + DB status

Vercel Project 2 — Frontend (frontend/)
  https://frontend-sepia-six-33.vercel.app
  └── Vue 3 SPA → calls backend URL via VITE_BACKENDURL
```

### CORS
The backend automatically allows all `*.vercel.app` origins — no extra config needed when both projects are on Vercel.

> **Note:** File uploads are not persisted on Vercel (serverless = no filesystem).
> Use Cloudinary or AWS S3 for production file uploads.

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