/**
 * Demo Seed Script
 * Creates: roles, 1 admin user, 1 seller user, 5 shops,
 *          10 categories, and 200 products (20 per category).
 *
 * Usage:  node backend/scripts/seedDemo.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User, Role } = require("../models/user");
const { Shop } = require("../models/shop");
const { Product, ProductCategory } = require("../models/product");
const { Site } = require("../models/site");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

// ─────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ─────────────────────────────────────────────────────────

const CATEGORY_DEFS = [
  { name: "Electronics",   emoji: "💻" },
  { name: "Clothing",      emoji: "👗" },
  { name: "Home & Garden", emoji: "🏡" },
  { name: "Sports",        emoji: "⚽" },
  { name: "Books",         emoji: "📚" },
  { name: "Toys & Games",  emoji: "🎮" },
  { name: "Beauty",        emoji: "💄" },
  { name: "Automotive",    emoji: "🚗" },
  { name: "Food & Drink",  emoji: "🍕" },
  { name: "Music",         emoji: "🎸" },
];

const SHOP_DEFS = [
  { name: "TechZone",    description: "The best electronics and gadgets at unbeatable prices." },
  { name: "FashionHub",  description: "Trendy clothing and accessories for every style." },
  { name: "HomeBliss",   description: "Everything you need to make your home beautiful." },
  { name: "SportsWorld", description: "Professional sports equipment and activewear." },
  { name: "BookNook",    description: "Thousands of books, games, and toys for all ages." },
];

// 200 product definitions — 20 per category
const PRODUCT_DEFS = [

  // ──────────────────────────────────────────────────────
  // 0  ELECTRONICS (20)
  // ──────────────────────────────────────────────────────
  { name: 'MacBook Pro 14"',             price: 1999.99, category: 0, stock: 15,  description: 'Apple M3 chip, 16 GB RAM, 512 GB SSD – the ultimate laptop for professionals.' },
  { name: 'Sony WH-1000XM5',            price: 349.99,  category: 0, stock: 42,  description: 'Industry-leading noise-cancelling wireless headphones with 30-hour battery life.' },
  { name: 'Samsung 4K Monitor 32"',     price: 449.00,  category: 0, stock: 8,   description: 'Crystal-clear 4K UHD display with USB-C connectivity and HDR support.' },
  { name: 'Logitech MX Master 3S',      price: 99.99,   category: 0, stock: 60,  description: 'Advanced wireless mouse with ultra-fast scrolling and multi-device support.' },
  { name: 'iPad Air 5th Gen',           price: 749.00,  category: 0, stock: 25,  description: '10.9-inch Liquid Retina display, M1 chip. Perfect for creativity and productivity.' },
  { name: 'Dell XPS 15 Laptop',         price: 1799.00, category: 0, stock: 10,  description: '15.6" OLED touch display, Intel Core i7, RTX 4070. A powerhouse for creators.' },
  { name: 'Apple AirPods Pro 2',        price: 249.00,  category: 0, stock: 75,  description: 'Active Noise Cancellation with Transparency mode. H2 chip for immersive sound.' },
  { name: 'LG OLED C3 55" TV',         price: 1299.00, category: 0, stock: 6,   description: 'Self-lit OLED pixels, Dolby Vision & Atmos, 120Hz for fluid gaming.' },
  { name: 'GoPro Hero 12 Black',        price: 399.99,  category: 0, stock: 30,  description: '5.3K60 video, HyperSmooth 6.0 stabilisation, waterproof to 10m.' },
  { name: 'Google Pixel 8 Pro',         price: 999.00,  category: 0, stock: 20,  description: 'Google Tensor G3 chip, 50 MP triple camera, 7 years of OS updates.' },
  { name: 'ASUS ROG Gaming Laptop',     price: 1549.00, category: 0, stock: 9,   description: '16" QHD 165Hz display, RTX 4080, AMD Ryzen 9. Dominate every game.' },
  { name: 'Kindle Paperwhite 11th Gen', price: 139.99,  category: 0, stock: 110, description: '6.8" glare-free display, adjustable warm light, waterproof, 10-week battery.' },
  { name: 'Ring Video Doorbell Pro 2',  price: 249.99,  category: 0, stock: 44,  description: '1536p HD video, 3D Motion Detection, Bird\'s Eye View with aerial maps.' },
  { name: 'Razer BlackWidow V3 KB',     price: 139.99,  category: 0, stock: 53,  description: 'Mechanical gaming keyboard with Razer Green clicky switches and RGB lighting.' },
  { name: 'Anker 65W USB-C Charger',   price: 45.99,   category: 0, stock: 200, description: 'GaN II technology. Charges a MacBook Pro 14" in 2 hours. Compact design.' },
  { name: 'Samsung Galaxy Tab S9',      price: 799.00,  category: 0, stock: 17,  description: '11" Dynamic AMOLED display, Snapdragon 8 Gen 2, S-Pen included.' },
  { name: 'WD 2TB Portable SSD',       price: 129.99,  category: 0, stock: 88,  description: 'Up to 1,050 MB/s read speeds. Bus-powered, pocket-sized, password protection.' },
  { name: 'Bose QuietComfort 45',      price: 329.00,  category: 0, stock: 35,  description: 'World-class noise cancellation, comfortable over-ear design, 24-hour battery.' },
  { name: 'Elgato Stream Deck MK.2',   price: 149.99,  category: 0, stock: 28,  description: '15 customisable LCD keys. One-touch control for streaming, editing and more.' },
  { name: 'Philips Hue Play Light Bar', price: 79.99,   category: 0, stock: 62,  description: 'Smart RGBW entertainment lighting. Syncs with your screen for immersive gaming.' },

  // ──────────────────────────────────────────────────────
  // 1  CLOTHING (20)
  // ──────────────────────────────────────────────────────
  { name: 'Nike Air Max 270',           price: 149.99, category: 1, stock: 80,  description: 'Iconic Air Max cushioning with a modern design. Available in multiple colourways.' },
  { name: "Levi's 501 Original Jeans",  price: 69.99,  category: 1, stock: 120, description: "The original straight-leg jean. Timeless style, durable denim." },
  { name: 'North Face Puffer Jacket',   price: 199.00, category: 1, stock: 30,  description: 'Lightweight 700-fill down insulation keeps you warm in the coldest conditions.' },
  { name: 'Adidas Running T-Shirt',     price: 34.99,  category: 1, stock: 200, description: 'Breathable Climalite fabric wicks moisture for maximum comfort during workouts.' },
  { name: 'Ray-Ban Wayfarer',           price: 154.00, category: 1, stock: 45,  description: 'Classic acetate sunglasses with G-15 lenses. UV400 protection.' },
  { name: 'Columbia Rain Jacket',       price: 119.99, category: 1, stock: 40,  description: 'Omni-Tech waterproof breathable shell. Sealed seams, adjustable hood.' },
  { name: 'Patagonia Fleece Pullover',  price: 139.00, category: 1, stock: 55,  description: 'Made from 100% recycled polyester fleece. Planet-friendly warmth.' },
  { name: 'Tommy Hilfiger Polo Shirt',  price: 59.99,  category: 1, stock: 150, description: 'Classic fit, 100% cotton piqué polo with embroidered logo. Versatile essential.' },
  { name: 'Under Armour Compression',  price: 44.99,  category: 1, stock: 180, description: 'HeatGear compression shorts. Moisture transport, 4-way stretch, anti-odour.' },
  { name: 'Birkenstock Arizona Sandals',price: 99.95,  category: 1, stock: 66,  description: 'Two-strap sandal with iconic contoured cork footbed and leather upper.' },
  { name: 'Champion Hoodie',           price: 54.99,  category: 1, stock: 200, description: 'Classic reverse-weave heavyweight hoodie. Pill-resistant fleece interior.' },
  { name: 'Lululemon Align Leggings',  price: 98.00,  category: 1, stock: 70,  description: 'Buttery-soft Nulu fabric. 28" inseam, hidden waistband pocket. 4-way stretch.' },
  { name: 'Timberland 6" Boot',        price: 199.00, category: 1, stock: 35,  description: 'Waterproof premium nubuck leather, rustproof hardware, padded collar.' },
  { name: 'Carhartt WIP T-Shirt',      price: 39.99,  category: 1, stock: 160, description: 'Loose fit, relaxed silhouette. Made from 100% organic cotton.' },
  { name: 'ASOS Slim Chino Trousers',  price: 42.00,  category: 1, stock: 100, description: 'Stretch cotton slim-fit chinos with five-pocket styling. Work or weekend.' },
  { name: 'New Balance 574 Trainers',  price: 89.99,  category: 1, stock: 90,  description: 'Classic 574 silhouette with ENCAP midsole for all-day cushioning and support.' },
  { name: 'Helly Hansen Ski Jacket',   price: 349.00, category: 1, stock: 18,  description: 'HELLY TECH® Protection. Fully seam-sealed, 10K waterproofing, 8K breathability.' },
  { name: 'Calvin Klein Boxer Briefs', price: 36.99,  category: 1, stock: 300, description: 'Pack of 3. Ultra-soft micro-modal fabric, ergonomic pouch, tagless comfort.' },
  { name: 'Fossil Gen 6 Smartwatch',   price: 279.00, category: 1, stock: 22,  description: 'Wear OS, heart rate, GPS, sleep tracking. Classic stainless steel case.' },
  { name: 'Fjällräven Kånken Backpack',price: 109.99, category: 1, stock: 58,  description: 'Iconic Swedish backpack made from durable Vinylon F fabric. 16L capacity.' },

  // ──────────────────────────────────────────────────────
  // 2  HOME & GARDEN (20)
  // ──────────────────────────────────────────────────────
  { name: 'Dyson V15 Detect',          price: 749.99, category: 2, stock: 12,  description: 'Laser reveals invisible dust. Automatically adapts suction to the task at hand.' },
  { name: 'Instant Pot Duo 7-in-1',    price: 89.95,  category: 2, stock: 55,  description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan and warmer.' },
  { name: 'IKEA KALLAX Shelf',         price: 119.00, category: 2, stock: 22,  description: 'Versatile shelving unit, perfect for living rooms, home offices and hallways.' },
  { name: 'Philips Hue Starter Kit',   price: 199.95, category: 2, stock: 38,  description: 'Smart LED bulbs you control with voice or app. 16 million colours.' },
  { name: 'Weber Spirit Gas Grill',    price: 529.00, category: 2, stock: 7,   description: '3-burner gas grill with GS4 grilling system. Porcelain-enamelled grates.' },
  { name: 'Kärcher K5 Pressure Washer',price: 329.00, category: 2, stock: 14,  description: '145 bar max pressure. 500L/hr flow rate. Includes patio cleaner accessory.' },
  { name: 'Roomba i7+ Robot Vacuum',   price: 799.00, category: 2, stock: 9,   description: 'Empties itself for 60 days, learns your home, customisable cleaning zones.' },
  { name: 'Nespresso Vertuo Pop',      price: 99.00,  category: 2, stock: 45,  description: 'Compact coffee & espresso maker. 5 cup sizes. Centrifusion technology.' },
  { name: 'Ring Alarm 8-Piece Kit',   price: 329.00, category: 2, stock: 16,  description: 'Professional-grade home security system. Works with Alexa, no contracts.' },
  { name: 'Nest Learning Thermostat',  price: 249.00, category: 2, stock: 33,  description: 'Learns your schedule, programs itself, saves up to 15% on cooling bills.' },
  { name: 'Le Creuset Dutch Oven 5.5L',price: 399.95, category: 2, stock: 20,  description: 'Enamelled cast iron. Even heat distribution. Lifetime guarantee. Iconic design.' },
  { name: 'Gardena Irrigation System', price: 149.00, category: 2, stock: 28,  description: 'Automatic watering for up to 40 plants. Programmable timer, adjustable heads.' },
  { name: 'Lay-Z-Spa Miami Hot Tub',  price: 449.00, category: 2, stock: 5,   description: '4-person inflatable hot tub. 40°C max, 81 air jets, freeze shield.' },
  { name: 'Bosch Cordless Drill GSB18',price: 129.99, category: 2, stock: 42,  description: '18V brushless drill-driver, 2× 2Ah batteries, 13mm metal keyless chuck.' },
  { name: 'Arlo Pro 4 Security Camera',price: 199.99, category: 2, stock: 37,  description: '2K HDR video, colour night vision, built-in spotlight, weather-resistant.' },
  { name: 'Silentnight Miracoil Mattress',price: 599.00,category:2, stock: 8,  description: 'King size. Open-coil Miracoil springs, memory foam top layer, 5-year guarantee.' },
  { name: 'Breville Smart Toaster',   price: 59.99,  category: 2, stock: 70,  description: '4-slice toaster with A Bit More® button and Lift & Look® without cancelling.' },
  { name: 'DeWalt Tool Combo Kit',     price: 379.00, category: 2, stock: 11,  description: '20V MAX cordless drill, impact driver, circular saw, and reciprocating saw.' },
  { name: 'Yankee Candle Gift Set',    price: 49.99,  category: 2, stock: 95,  description: '5 signature scented jar candles. Clean Cotton, Vanilla Cupcake, and more.' },
  { name: 'Miele Classic C1 Vacuum',  price: 399.00, category: 2, stock: 17,  description: 'German-engineered canister vacuum. 1200W Vortex motor, AirClean filtration.' },

  // ──────────────────────────────────────────────────────
  // 3  SPORTS (20)
  // ──────────────────────────────────────────────────────
  { name: 'Peloton Bike+',             price: 2495.00, category: 3, stock: 5,   description: 'Auto-follow resistance, rotating HD touchscreen, immersive fitness classes.' },
  { name: 'Wilson Pro Staff Tennis',   price: 229.00,  category: 3, stock: 18,  description: 'Iconic racket used by Roger Federer. Braided graphite construction, 97 sq in.' },
  { name: 'Garmin Forerunner 955',     price: 499.99,  category: 3, stock: 27,  description: 'GPS running & triathlon smartwatch with training load insights and full mapping.' },
  { name: 'Hydro Flask 32oz',          price: 44.95,   category: 3, stock: 150, description: 'Double-wall vacuum insulation keeps drinks cold 24h or hot 12h.' },
  { name: 'Yoga Mat Premium 6mm',      price: 79.00,   category: 3, stock: 90,  description: 'Non-slip TPE surface with alignment lines. Eco-friendly, sweat-resistant.' },
  { name: 'Callaway Rogue ST Driver',  price: 399.00,  category: 3, stock: 12,  description: 'Jailbreak AI Speed Frame. Triaxial carbon crown for maximum ball speed.' },
  { name: 'Speedo Fastskin Swimsuit',  price: 89.99,   category: 3, stock: 55,  description: 'Hydrophobic fabric repels water. Chlorine-resistant. Race-cut leg.' },
  { name: 'Bowflex SelectTech 552',    price: 429.00,  category: 3, stock: 16,  description: 'Adjustable dumbbells 5–52.5 lbs each. Replaces 15 sets. Space-saving design.' },
  { name: 'Decathlon Rockrider Bike',  price: 799.00,  category: 3, stock: 8,   description: '27.5" aluminium hardtail MTB. Shimano 21-speed, hydraulic disc brakes.' },
  { name: 'TRX Home2 Suspension Trainer',price:189.95, category: 3, stock: 60,  description: 'Military-grade nylon straps. Full-body workout anywhere. 300+ exercises.' },
  { name: 'Nike Football Size 5',      price: 29.99,   category: 3, stock: 200, description: 'FIFA Quality Pro certified. Machine-stitched casing, butyl rubber bladder.' },
  { name: 'HEAD Gravity Tennis Bag',   price: 119.00,  category: 3, stock: 33,  description: 'Holds up to 12 rackets. Climate control compartment, shoe section, CCT+.' },
  { name: 'Fitbit Charge 6',          price: 159.99,  category: 3, stock: 70,  description: 'Google Maps on your wrist, ECG app, built-in GPS, 7-day battery life.' },
  { name: 'Arena Carbon Air2 Goggles',  price: 39.99,   category: 3, stock: 85,  description: 'Carbon fibre reinforced frame, anti-fog, UV protection, silicone gasket.' },
  { name: 'Nordic Ware Baking Rack',   price: 24.99,   category: 3, stock: 110, description: '100% natural bamboo. BPA-free, dishwasher safe, stackable design.' },
  { name: 'Climbing Chalk 300g',       price: 12.99,   category: 3, stock: 300, description: 'Pure magnesium carbonate, no added filler. Dries hands instantly for better grip.' },
  { name: 'Precor EFX 885 Elliptical', price: 3999.00, category: 3, stock: 3,   description: 'Cross Ramp 13–40°, 20 resistance levels, integrated HR monitoring.' },
  { name: 'Osprey Talon 22 Backpack',  price: 139.95,  category: 3, stock: 44,  description: 'Trail-running daypack. BioStretch harness, hipbelt, 22L, hydration compatible.' },
  { name: 'Lifeline Power Wheel',      price: 49.99,   category: 3, stock: 120, description: 'Ab roller with non-slip handles. Build core strength, targets 20+ muscles.' },
  { name: 'Speedo Aquabeat MP3 Player',price: 89.00,   category: 3, stock: 28,  description: 'Waterproof to 3m, 8GB storage, flat OLED display, secure clip attachment.' },

  // ──────────────────────────────────────────────────────
  // 4  BOOKS (20)
  // ──────────────────────────────────────────────────────
  { name: 'Atomic Habits',                    price: 18.99, category: 4, stock: 200, description: "James Clear's #1 NYT bestseller. Tiny changes, remarkable results." },
  { name: 'The Pragmatic Programmer',         price: 49.95, category: 4, stock: 75,  description: '20th anniversary edition. Your journey to mastery in software development.' },
  { name: 'Dune',                             price: 15.99, category: 4, stock: 160, description: "Frank Herbert's classic sci-fi masterpiece. The bestselling SF novel of all time." },
  { name: 'Sapiens',                          price: 19.99, category: 4, stock: 140, description: "Yuval Noah Harari's sweeping history of humankind from Stone Age to 21st century." },
  { name: 'Clean Code',                       price: 39.99, category: 4, stock: 88,  description: "Robert C. Martin's handbook of agile software craftsmanship. Essential for devs." },
  { name: 'The Psychology of Money',          price: 17.99, category: 4, stock: 175, description: 'Morgan Housel on timeless lessons on wealth, greed, and happiness.' },
  { name: 'Zero to One',                      price: 16.99, category: 4, stock: 120, description: 'Peter Thiel on notes about startups and how to build the future.' },
  { name: 'The Lean Startup',                 price: 18.00, category: 4, stock: 95,  description: 'Eric Ries on how continuous innovation creates radically successful businesses.' },
  { name: 'Harry Potter Box Set',             price: 89.99, category: 4, stock: 50,  description: 'All 7 volumes in a handsome illustrated slipcase. Hardcover collector edition.' },
  { name: 'Designing Data-Intensive Apps',    price: 59.95, category: 4, stock: 65,  description: "Martin Kleppmann's definitive guide to building reliable, scalable systems." },
  { name: 'Rich Dad Poor Dad',               price: 14.99, category: 4, stock: 210, description: "Robert Kiyosaki's personal finance classic. What the rich teach their kids." },
  { name: 'The Art of War',                  price: 9.99,  category: 4, stock: 250, description: "Sun Tzu's ancient Chinese military treatise. Timeless strategy and tactics." },
  { name: 'Thinking, Fast and Slow',         price: 19.99, category: 4, stock: 130, description: 'Daniel Kahneman on the two systems that drive the way we think.' },
  { name: 'Deep Work',                       price: 17.99, category: 4, stock: 105, description: 'Cal Newport on rules for focused success in a distracted world.' },
  { name: 'Introduction to Algorithms',      price: 99.00, category: 4, stock: 40,  description: 'CLRS — the definitive textbook for computer science algorithms. 4th edition.' },
  { name: 'The Hitchhiker Guide to Galaxy', price: 13.99, category: 4, stock: 155, description: "Douglas Adams' cult classic comedy sci-fi. 42 and all that." },
  { name: 'Steve Jobs Biography',           price: 21.99, category: 4, stock: 80,  description: "Walter Isaacson's definitive biography of Apple's visionary co-founder." },
  { name: 'Elon Musk Biography',            price: 24.99, category: 4, stock: 90,  description: "Walter Isaacson's intimate portrait of the most daring entrepreneur of our time." },
  { name: 'The Midnight Library',           price: 14.99, category: 4, stock: 145, description: 'Matt Haig. A library exists between life and death. Every book a different life.' },
  { name: 'Educated',                        price: 16.99, category: 4, stock: 120, description: "Tara Westover's extraordinary memoir of self-invention. A NYT #1 bestseller." },

  // ──────────────────────────────────────────────────────
  // 5  TOYS & GAMES (20)
  // ──────────────────────────────────────────────────────
  { name: 'PlayStation 5 Console',      price: 499.00, category: 5, stock: 4,   description: 'Next-gen gaming with ultra-high speed SSD, 3D Audio, and haptic feedback.' },
  { name: 'LEGO Technic Bugatti',       price: 449.99, category: 5, stock: 11,  description: '3,599-piece 1:8 scale model with working W16 engine pistons and gearbox.' },
  { name: 'Nintendo Switch OLED',       price: 349.00, category: 5, stock: 20,  description: 'Vivid 7-inch OLED screen. Play at home or on the go. Includes 64GB storage.' },
  { name: 'Monopoly Classic',           price: 24.99,  category: 5, stock: 100, description: "The world's favourite family board game. Buy, sell, trade properties to win." },
  { name: "Rubik's Speed Cube",         price: 17.99,  category: 5, stock: 250, description: 'Official 3×3 speed cube with corner cutting and smooth turning mechanism.' },
  { name: 'Xbox Series X',              price: 499.00, category: 5, stock: 7,   description: '4K gaming at 120fps, 12 teraflops of power, Quick Resume, Game Pass ready.' },
  { name: 'LEGO Star Wars Millennium Falcon', price: 849.99, category: 5, stock: 6, description: '7,541 pieces. Over 1:1 scale. Most detailed LEGO Star Wars set ever made.' },
  { name: 'Catan Board Game',           price: 49.99,  category: 5, stock: 80,  description: 'Award-winning strategy game for 3–4 players. Collect, trade, build, settle.' },
  { name: 'Hot Wheels Ultimate Garage', price: 139.99, category: 5, stock: 22,  description: '5-level parking garage holds 140+ cars, elevator lift, loop and jump features.' },
  { name: 'LEGO Architecture Eiffel Tower', price: 229.99, category: 5, stock: 15, description: '10,001-piece detailed replica. The most complex LEGO set ever released.' },
  { name: 'Hasbro Jenga Giant',         price: 74.99,  category: 5, stock: 38,  description: 'Stacks up to 5 feet high. 54 hardwood blocks, premium carry bag included.' },
  { name: 'VTech Baby Learning Table',  price: 29.99,  category: 5, stock: 95,  description: 'Interactive baby activity table with 6 learning modes, music and lights.' },
  { name: 'Barbie Dreamhouse',          price: 199.00, category: 5, stock: 18,  description: '3-story dollhouse with 75+ accessories, pool with slide, elevator and more.' },
  { name: 'Ticket to Ride Europe',      price: 54.99,  category: 5, stock: 65,  description: 'Build train routes across Europe in this classic strategy board game.' },
  { name: 'Nerf Elite 2.0 Blaster',     price: 34.99,  category: 5, stock: 110, description: 'Motorised blaster fires 10 Nerf darts in a row. Customisable barrel and stock.' },
  { name: 'DJI Mini 3 Drone',           price: 759.00, category: 5, stock: 13,  description: 'Under 249g, 4K HDR video, 51min flight time, Return to Home, OcuSync.' },
  { name: 'Razer Kishi V2 Controller',  price: 99.99,  category: 5, stock: 47,  description: 'Universal gaming controller for Android. Micro-switches, low latency, USB-C.' },
  { name: 'Play-Doh Ultimate Color Kit',price: 39.99,  category: 5, stock: 130, description: '65 non-toxic colours, 6 fun tools included. Hours of creative play.' },
  { name: 'Osmo Genius Starter Kit',    price: 99.00,  category: 5, stock: 25,  description: 'iPad game system blending physical and digital play. 5 award-winning games.' },
  { name: 'Exploding Kittens Card Game',price: 19.99,  category: 5, stock: 180, description: 'Hilarious strategic card game for 2–5 players. Fast, funny, family-friendly.' },

  // ──────────────────────────────────────────────────────
  // 6  BEAUTY (20)
  // ──────────────────────────────────────────────────────
  { name: 'Dyson Airwrap Multi-Styler', price: 599.99, category: 6, stock: 9,   description: 'Curls, waves, smooths and dries with no extreme heat. Multiple attachments.' },
  { name: 'La Mer Moisturising Cream',  price: 195.00, category: 6, stock: 33,  description: 'Iconic moisturiser with Miracle Broth™. Visibly transforms the look of skin.' },
  { name: 'Charlotte Tilbury Palette',  price: 75.00,  category: 6, stock: 55,  description: 'Hollywood-inspired 8-shade neutral eye shadow palette. Wearable everyday looks.' },
  { name: 'Olaplex No.3 Hair Perfector',price: 28.00,  category: 6, stock: 120, description: 'Award-winning at-home strengthening treatment. Visibly reduces breakage.' },
  { name: 'Tatcha Rice Wash Cleanser',  price: 38.00,  category: 6, stock: 77,  description: 'Silky Japanese cleanser dissolves makeup and cleanses without stripping skin.' },
  { name: 'Fenty Beauty Pro Filt\'r Foundation',price:38.00,category:6,stock:95, description: '50 shades, buildable medium-to-full coverage, matte finish, 24hr wear.' },
  { name: 'The Ordinary Niacinamide 10%',price:7.90,   category: 6, stock: 300, description: 'High-strength vitamin & mineral blemish formula. Reduces pore appearance.' },
  { name: 'Foreo Luna 4 Face Brush',    price: 169.00, category: 6, stock: 42,  description: 'Silicone facial cleansing device. 16 intensities, 35-use charge, T-Sonic.' },
  { name: 'MAC Studio Fix Powder',      price: 34.00,  category: 6, stock: 110, description: 'Lightweight pressed powder. Sets foundation, reduces shine, light coverage.' },
  { name: 'NARS Orgasm Blush',          price: 32.00,  category: 6, stock: 88,  description: 'Sheer golden pink with golden shimmer. The iconic shade that suits every skintone.' },
  { name: 'Kiehl\'s Ultra Facial Cream', price: 52.00,  category: 6, stock: 65,  description: '24-hour hydrating moisturiser with glacial glycoprotein extract. Non-greasy.' },
  { name: 'Caudalie Beauty Elixir',     price: 49.00,  category: 6, stock: 55,  description: 'Instantly refreshes, tightens pores and sets makeup. Rose water mist.' },
  { name: 'Benefit Brow Pencil',        price: 25.00,  category: 6, stock: 140, description: 'Micro-fine triangular tip pencil for natural-looking defined brows.' },
  { name: 'Urban Decay All Nighter Spray',price:33.00, category: 6, stock: 100, description: 'Sets makeup for 16+ hours. Keeps everything locked in through heat and sweat.' },
  { name: 'Clinique Even Better CC Cream',price:39.00, category: 6, stock: 75,  description: 'SPF50 CC cream that corrects, covers and hydrates in one step.' },
  { name: 'GHD Platinum+ Straightener', price: 259.00, category: 6, stock: 28,  description: 'Predictive technology maintains 185°C for the ideal style temperature.' },
  { name: 'Elemis Pro-Collagen Marine Cream',price:95.00,category:6,stock:40,  description: 'Anti-ageing moisturiser clinically proven to reduce wrinkles in 14 days.' },
  { name: 'Anastasia Beverly Hills Brow Kit',price:42.00,category:6,stock:85,  description: 'Full brow kit: clear gel, dual-ended brush, highlighting powder.' },
  { name: 'Huda Beauty Liquid Matte Lipstick',price:25.00,category:6,stock:120,description: 'Ultra-comfortable liquid matte. 20 shades, 12-hour transfer-proof wear.' },
  { name: 'Dr. Jart+ Cicapair Tiger Cream',price:48.00,category:6, stock: 60,  description: 'Colour-correcting treatment cream. Centella asiatica calms, soothes and heals.' },

  // ──────────────────────────────────────────────────────
  // 7  AUTOMOTIVE (20)
  // ──────────────────────────────────────────────────────
  { name: 'Garmin DashCam 67W',         price: 199.99, category: 7, stock: 41,  description: '1440p, 180° wide-angle lens, voice control, automatic incident detection.' },
  { name: 'NOCO Boost Plus GB40',       price: 99.95,  category: 7, stock: 63,  description: '1000A 12V portable lithium jump starter for up to 6L gas or 3L diesel engines.' },
  { name: 'WeatherTech Floor Mats',     price: 149.00, category: 7, stock: 29,  description: 'Custom-fit laser-measured all-weather mats for total interior protection.' },
  { name: 'Anker Car Charger 65W',      price: 35.99,  category: 7, stock: 180, description: 'GaN dual USB-C PD + one USB-A. Charge 3 devices simultaneously at speed.' },
  { name: 'Chemical Guys Detailing Kit',price: 79.95,  category: 7, stock: 47,  description: 'Professional bundle: wash, wax, clay bar, interior cleaner, applicators.' },
  { name: 'Thule Roof Box 400L',        price: 699.00, category: 7, stock: 8,   description: 'Aerodynamic ABS rooftop cargo box. Dual side opening, LED light kit included.' },
  { name: 'Michelin CrossClimate 2 Tyre',price:149.00, category: 7, stock: 50,  description: '225/45 R17. Year-round performance tyre with snow, wet and dry grip rating A.' },
  { name: 'Bosch S5 Car Battery 77Ah',  price: 119.99, category: 7, stock: 30,  description: 'Reliable starter battery. Fit for most European vehicles. 2-year warranty.' },
  { name: 'Meguiar\'s Ultimate Wax 3-Pack',price:59.99,category: 7, stock: 75,  description: 'Carnauba-blend wax. SiO2 hybrid formula for long-lasting gloss protection.' },
  { name: '3M Headlight Restoration Kit',price:24.99,  category: 7, stock: 110, description: 'Restores yellowed/foggy headlights to like-new clarity in under 30 minutes.' },
  { name: 'Halfords Torque Wrench 3/8"',price: 39.99,  category: 7, stock: 55,  description: '5–80Nm adjustable torque wrench. Audible click, reversible ratchet.' },
  { name: 'RAC Tyre Inflator 12V',      price: 34.99,  category: 7, stock: 88,  description: 'Portable digital tyre inflator with auto-cutoff. 12V car power socket.' },
  { name: 'Nextbase 622GW Dash Cam',    price: 299.00, category: 7, stock: 19,  description: '4K 30fps, built-in polarising filter, what3words location, Emergency SOS.' },
  { name: 'Ring Automotive Jump Starter',price:79.99,  category: 7, stock: 36,  description: '1500A peak lithium power pack. Also charges phones. Compact carry case.' },
  { name: 'Turtle Wax Hybrid Solutions',price:19.99,   category: 7, stock: 130, description: 'Ceramic + SiO2 spray wax. 1-step shine and protection for any paint finish.' },
  { name: 'Autoglym Leather Cleaner',   price: 14.99,  category: 7, stock: 95,  description: 'Deep cleans leather seats and trim without damaging or drying out the hide.' },
  { name: 'Osram Night Breaker H7',     price: 24.99,  category: 7, stock: 120, description: 'Up to 220% more brightness on road vs. standard halogen. Lifetime guarantee.' },
  { name: 'Halfords 12V Portable Compressor',price:49.99,category:7,stock:44,  description: 'Auto-stop, digital display. Inflates car tyre from flat in under 6 minutes.' },
  { name: 'Maxi-Cosi Pebble 360 Car Seat',price:399.00,category:7,stock:12,   description: 'Rotating i-Size car seat from birth to 12kg. Easy installation, 360° swivel.' },
  { name: 'Halfords Advanced 4-Drawer Cabinet',price:249.00,category:7,stock:7, description: 'Heavy-duty steel roller cabinet. 28 kg load per drawer, full extension slides.' },

  // ──────────────────────────────────────────────────────
  // 8  FOOD & DRINK (20)
  // ──────────────────────────────────────────────────────
  { name: 'Nespresso Vertuo Next',      price: 179.00, category: 8, stock: 36,  description: 'Brew 5 cup sizes from espresso to Alto. Bluetooth connectivity, 11 colours.' },
  { name: 'KitchenAid Stand Mixer 5Qt', price: 449.00, category: 8, stock: 14,  description: '10 speeds, 59 touchpoints, bowl-lift design. Iconic professional results.' },
  { name: 'Vitamix E310 Blender',       price: 349.95, category: 8, stock: 19,  description: 'Aircraft-grade stainless blades. Pulverises anything in under 60 seconds.' },
  { name: 'Whole Bean Coffee Bag 1kg',  price: 22.99,  category: 8, stock: 300, description: 'Single-origin Ethiopian Yirgacheffe, medium roast. Notes of blueberry & jasmine.' },
  { name: 'Organic Whey Protein 3lb',   price: 54.99,  category: 8, stock: 85,  description: '25g protein per serving, no artificial sweeteners, grass-fed New Zealand whey.' },
  { name: 'Le Creuset Cooking Set 5pc', price: 699.00, category: 8, stock: 6,   description: 'Iconic volcanic cast iron cookware. Even heat, stick-resistant interior.' },
  { name: 'Ninja Foodi 9-in-1 Air Fryer',price:229.00, category: 8, stock: 28,  description: 'Air fry, roast, bake, grill, dehydrate and more. 7.6L family-size capacity.' },
  { name: 'Ooni Koda 16 Pizza Oven',    price: 499.00, category: 8, stock: 9,   description: 'Gas-powered outdoor pizza oven. Reaches 500°C. Cooks pizza in 60 seconds.' },
  { name: 'Seed & Bean 70% Dark Choc',  price: 8.99,   category: 8, stock: 500, description: 'Organic fairtrade dark chocolate bars. Rich, smooth, intensely flavoured.' },
  { name: 'Hario V60 Pour-Over Set',    price: 59.99,  category: 8, stock: 65,  description: 'Classic Japanese pour-over brewer with 40 paper filters and glass server.' },
  { name: 'Tefal ActiFry Genius XL 2kg',price:199.99,  category: 8, stock: 22,  description: 'Patented paddle stirs automatically. Cooks 1.7kg chips with just 1 spoon oil.' },
  { name: 'Royal Canin Medium Adult 15kg',price:89.99, category: 8, stock: 40,  description: 'Tailored nutrition for medium-breed adult dogs. Digestive & skin health support.' },
  { name: 'Lavazza Super Crema Beans 1kg',price:19.99, category: 8, stock: 200, description: 'Medium espresso roast. Honey, almonds and dried fruit aroma. Italian blend.' },
  { name: 'Huel Black Edition Meal',     price: 74.99,  category: 8, stock: 55,  description: '400 kcal, 40g protein, 26 vitamins and minerals per serving. Chocolate Salted Caramel.' },
  { name: 'Whisky Advent Calendar',     price: 169.00, category: 8, stock: 10,  description: '24 x 3cl drams of premium single malts and world whiskies. Beautifully boxed.' },
  { name: 'Corkcicle Cocktail Shaker',  price: 39.99,  category: 8, stock: 75,  description: 'Triple-insulated stainless steel. Keeps drinks cold for hours. Easy-pour lid.' },
  { name: 'Nando\'s PERi-PERi Sauce Set',price:24.99,  category: 8, stock: 150, description: 'All 5 iconic heat levels from Lemon & Herb to Extra Hot. Gift box set.' },
  { name: 'Thermomix TM6',              price: 1399.00,category: 8, stock: 4,   description: 'All-in-one smart kitchen appliance. Weighs, chops, cooks, steams, stirs.' },
  { name: 'Clipper Organic Tea 80 Bags', price: 6.99,   category: 8, stock: 400, description: 'Classic everyday English breakfast tea. Organic, fairtrade, unbleached bags.' },
  { name: 'Bonne Maman Jam Hamper',     price: 49.99,  category: 8, stock: 30,  description: 'Six premium French conserves: strawberry, apricot, raspberry, fig and more.' },

  // ──────────────────────────────────────────────────────
  // 9  MUSIC (20)
  // ──────────────────────────────────────────────────────
  { name: 'Fender Player Stratocaster', price: 849.99, category: 9, stock: 8,   description: 'Three Player Series Alnico 5 single-coil pickups, 2-point tremolo, maple neck.' },
  { name: 'Roland FP-30X Digital Piano',price: 699.00, category: 9, stock: 6,   description: '88 weighted keys, SuperNATURAL piano modelling, Bluetooth, built-in speakers.' },
  { name: 'Audio-Technica AT2020',      price: 99.00,  category: 9, stock: 52,  description: 'Side-address cardioid condenser mic. Studio favourite for vocals & instruments.' },
  { name: 'Shure SM58 Vocal Mic',       price: 99.00,  category: 9, stock: 68,  description: 'Industry-standard dynamic vocal microphone. Legendary reliability on stage.' },
  { name: 'Teenage Engineering OP-1 Field',price:1999.00,category:9,stock: 3,  description: 'Ultra-portable synthesiser, sampler, and recorder in one iconic device.' },
  { name: 'Gibson Les Paul Studio',     price: 1499.99,category: 9, stock: 5,   description: 'Mahogany body, maple top, BurstBucker pickups, classic vintage sunburst finish.' },
  { name: 'Yamaha P-45 Digital Piano',  price: 449.00, category: 9, stock: 14,  description: '88 Graded Hammer Standard keys, pure CF Sound Generator, compact design.' },
  { name: 'Focusrite Scarlett 2i2 4th Gen',price:169.00,category:9,stock:55,   description: 'USB audio interface. 2 preamps, Air mode, 192kHz/24-bit, low noise floor.' },
  { name: 'Akai MPK Mini MK3',          price: 119.00, category: 9, stock: 70,  description: '25 velocity-sensitive mini keys, 8 RGB MPC pads, arpeggiator, USB-powered.' },
  { name: 'Rode NT1 5th Gen Microphone',price: 249.00, category: 9, stock: 28,  description: 'Dual analogue/USB output, ultra-low noise (4dBA), includes Rycote shockmount.' },
  { name: 'Boss RC-5 Loop Station',     price: 229.00, category: 9, stock: 33,  description: '99 phrase memories, MIDI sync, 13 hours recording time. Stereo I/O.' },
  { name: 'Arturia KeyLab 49 MkII',     price: 449.00, category: 9, stock: 11,  description: 'Hybrid MIDI controller with 49 velocity-sensitive keys, endless encoders, DAW control.' },
  { name: 'Zildjian A Custom Cymbal Set',price:799.00, category: 9, stock: 7,   description: '14" hi-hats, 16" and 18" crashes, 20" ride. Brilliant finish, sensitive feel.' },
  { name: 'Marshall Origin 20C Amp',    price: 499.00, category: 9, stock: 10,  description: '20W all-valve combo amplifier. 1×10" speaker, attenuation, effects loop.' },
  { name: 'Korg Minilogue XD Synth',    price: 649.00, category: 9, stock: 8,   description: '4-voice analogue polyphonic synthesiser with digital multi-engine and effects.' },
  { name: 'DW Design Series 5-Piece Drum Kit',price:1499.00,category:9,stock:4,description: 'Maple/mahogany hybrid shells, True-Pitch tension rods, Remo heads, chrome hardware.' },
  { name: 'Sennheiser HD 650 Headphones',price:349.00, category: 9, stock: 22,  description: 'Open-back reference headphones. Legendary audiophile sound for studio use.' },
  { name: 'iRig Acoustic Stage Mic',    price: 99.99,  category: 9, stock: 45,  description: 'Clip-on microphone system for acoustic guitar. Connects to iPhone, iPad or Mac.' },
  { name: 'M-Audio BX8 D3 Studio Monitor',price:299.00,category:9,stock:18,   description: '8" woofer, 130W bi-amplified. Detailed, accurate reference monitoring.' },
  { name: 'Native Instruments Komplete 14',price:599.00,category:9,stock:13,   description: '90+ instruments & effects, 120,000+ sounds. The industry-standard plugin bundle.' },
];

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function randomImage(name) {
  const seed = encodeURIComponent(name.replace(/\s+/g, "+"));
  return `https://picsum.photos/seed/${seed}/400/300`;
}

// ─────────────────────────────────────────────────────────
// MAIN SEED — exported as run(uri) so server.js can call it
// Can also be run standalone:  node scripts/seedDemo.js
// ─────────────────────────────────────────────────────────
async function seed(overrideUri) {
  const uri = overrideUri || MONGODB_URI;

  if (mongoose.connection.readyState !== 1) {
    console.log("🔗 Connecting to", uri.replace(/:\/\/.*@/, "://***@"));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB\n");
  } else {
    console.log("✅ Using existing MongoDB connection\n");
  }

  // ── Wipe existing demo data ──────────────────────────
  console.log("🗑  Clearing existing data...");
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Shop.deleteMany({}),
    ProductCategory.deleteMany({}),
    Product.deleteMany({}),
    Site.deleteMany({}),
  ]);

  // ── Roles ────────────────────────────────────────────
  console.log("👥 Creating roles...");
  const roles = {};
  for (const name of ["admin", "seller", "user"]) {
    roles[name] = await new Role({ name, users: [] }).save();
  }

  // ── Users ────────────────────────────────────────────
  console.log("👤 Creating users...");
  const hashedPass = await bcrypt.hash("demo1234", 10);

  const adminUser = await new User({
    username: "admin",
    email: "admin@demo.com",
    password: hashedPass,
    role: roles.admin._id,
    name: "Admin User",
  }).save();
  roles.admin.users.push(adminUser._id);

  const sellerUser = await new User({
    username: "seller",
    email: "seller@demo.com",
    password: hashedPass,
    role: roles.seller._id,
    name: "Demo Seller",
  }).save();
  roles.seller.users.push(sellerUser._id);

  const customerUser = await new User({
    username: "customer",
    email: "customer@demo.com",
    password: hashedPass,
    role: roles.user._id,
    name: "Demo Customer",
  }).save();
  roles.user.users.push(customerUser._id);

  await Promise.all(Object.values(roles).map((r) => r.save()));
  console.log("   admin@demo.com / seller@demo.com / customer@demo.com  (password: demo1234)");

  // ── Site ─────────────────────────────────────────────
  await new Site({
    name: "ShopHub",
    description: "A modern e-commerce marketplace",
    email: "hello@shophub.com",
    phone: "+1 555 123 4567",
  }).save();

  // ── Shops ────────────────────────────────────────────
  console.log("\n🏪 Creating shops...");
  const shopDocs = [];
  for (const s of SHOP_DEFS) {
    const shop = await new Shop({
      name: s.name,
      description: s.description,
      user: sellerUser._id,
      email: `${s.name.toLowerCase().replace(/\s+/g, "")}@demo.com`,
      phone: `+1 555 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      logo: `https://picsum.photos/seed/${s.name}/200/200`,
      address: { country: "USA", province: "California", city: "San Francisco", postCode: "94105", street: "Market St" },
    }).save();
    shopDocs.push(shop);
    console.log(`   ✔ ${s.name}`);
  }
  await User.findByIdAndUpdate(sellerUser._id, { shop: shopDocs[0]._id });

  // ── Categories ───────────────────────────────────────
  console.log("\n📦 Creating categories...");
  const categoryDocs = [];
  for (const c of CATEGORY_DEFS) {
    const cat = await new ProductCategory({ name: c.name, products: [] }).save();
    categoryDocs.push(cat);
    console.log(`   ✔ ${c.emoji} ${c.name}`);
  }

  // ── Products ─────────────────────────────────────────
  const total = PRODUCT_DEFS.length;
  console.log(`\n🛍️  Creating ${total} products (20 per category)...`);
  let count = 0;
  for (const p of PRODUCT_DEFS) {
    const shop     = shopDocs[count % shopDocs.length];
    const category = categoryDocs[p.category];

    const product = await new Product({
      name:        p.name,
      price:       p.price,
      description: p.description,
      stock:       p.stock,
      images:      [randomImage(p.name), randomImage(p.name + "-alt")],
      shop:        shop._id,
      categories:  [category._id],
      reviews:     [],
    }).save();

    await Shop.findByIdAndUpdate(shop._id,             { $push: { products: product._id } });
    await ProductCategory.findByIdAndUpdate(category._id, { $push: { products: product._id } });

    count++;
    if (count % 20 === 0) console.log(`   ... ${count}/${total} created`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────────");
  console.log(`  Roles:      ${Object.keys(roles).length}`);
  console.log(`  Users:      3  (admin / seller / customer)`);
  console.log(`  Shops:      ${shopDocs.length}`);
  console.log(`  Categories: ${categoryDocs.length}`);
  console.log(`  Products:   ${count}  (${count / categoryDocs.length} per category)`);
  console.log("─────────────────────────────────────────────────");
  console.log("\n  Login credentials (all use password: demo1234)");
  console.log("  admin@demo.com    – Admin role");
  console.log("  seller@demo.com   – Seller role");
  console.log("  customer@demo.com – Customer role");

  if (overrideUri === undefined) {
    await mongoose.disconnect();
  }
}

module.exports = { run: seed };

if (require.main === module) {
  seed().catch((err) => {
    console.error("\n❌ Seed failed:", err.message);
    process.exit(1);
  });
}
