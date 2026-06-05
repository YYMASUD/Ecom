# MongoDB Configuration & Optimization Guide

This document provides comprehensive instructions for setting up, configuring, and optimizing MongoDB for the e-commerce platform.

---

## Table of Contents

1. [Docker Setup](#docker-setup)
2. [Schema Design](#schema-design)
3. [Indexing Strategy](#indexing-strategy)
4. [Performance Optimization](#performance-optimization)
5. [Backup & Restore](#backup--restore)
6. [Security Configuration](#security-configuration)
7. [Monitoring](#monitoring)
8. [Production Deployment](#production-deployment)

---

## Docker Setup

### Enhanced Docker Compose Configuration

Create or update `backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6.0
    container_name: ecommerce_mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-password}
      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE:-ecommerce}
    volumes:
      # Persistent data storage
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      # Initialization script
      - ./mongo-entrypoint/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
      # Backup directory
      - ./backups:/backups
    command: >
      mongod 
      --auth
      --wiredTigerCacheSizeGB 1
      --logpath /var/log/mongodb/mongod.log
      --logappend
    networks:
      - ecommerce_network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  mongo-express:
    image: mongo-express:latest
    container_name: ecommerce_mongo_express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_INITDB_ROOT_USERNAME:-admin}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-password}
      ME_CONFIG_MONGODB_URL: mongodb://${MONGO_INITDB_ROOT_USERNAME:-admin}:${MONGO_INITDB_ROOT_PASSWORD:-password}@mongo:27017/
      ME_CONFIG_BASICAUTH_USERNAME: ${MONGO_EXPRESS_USER:-admin}
      ME_CONFIG_BASICAUTH_PASSWORD: ${MONGO_EXPRESS_PASSWORD:-pass}
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - ecommerce_network

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local

networks:
  ecommerce_network:
    driver: bridge
```

### Initialization Script

Update `backend/mongo-entrypoint/mongo-init.js`:

```javascript
// MongoDB Initialization Script
// This script runs when the container is first created

// Switch to admin database
db = db.getSiblingDB('admin');

// Authenticate as root user
db.auth('admin', 'password');

// Create ecommerce database
db = db.getSiblingDB('ecommerce');

// Create application user with read/write permissions
db.createUser({
  user: 'ecommerce_user',
  pwd: 'ecommerce_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ecommerce'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password must be at least 8 characters'
        }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Product name is required'
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Price must be a positive number'
        }
      }
    }
  }
});

db.createCollection('orders');
db.createCollection('carts');
db.createCollection('shops');
db.createCollection('reviews');
db.createCollection('categories');
db.createCollection('roles');

// Create indexes (see Indexing Strategy section)
print('Creating indexes...');

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

// Product indexes
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ categories: 1 });
db.products.createIndex({ shop: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ createdAt: -1 });
db.products.createIndex({ 'inventory.quantity': 1 });

// Order indexes
db.orders.createIndex({ user: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ orderStatus: 1 });
db.orders.createIndex({ 'items.shop': 1 });
db.orders.createIndex({ createdAt: -1 });

// Cart indexes
db.carts.createIndex({ user: 1 }, { unique: true });
db.carts.createIndex({ updatedAt: -1 });

// Shop indexes
db.shops.createIndex({ name: 1 });
db.shops.createIndex({ owner: 1 }, { unique: true });
db.shops.createIndex({ createdAt: -1 });

// Review indexes
db.reviews.createIndex({ product: 1 });
db.reviews.createIndex({ user: 1 });
db.reviews.createIndex({ createdAt: -1 });

// Category indexes
db.categories.createIndex({ name: 1 }, { unique: true });

print('Indexes created successfully');

// Insert default roles
db.roles.insertMany([
  { name: 'user', permissions: ['browse', 'purchase', 'review'] },
  { name: 'seller', permissions: ['browse', 'purchase', 'review', 'sell', 'manage_shop'] },
  { name: 'admin', permissions: ['all'] }
]);

// Insert default categories
db.categories.insertMany([
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
  { name: 'Books', slug: 'books', description: 'Books and publications' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Home and garden products' },
  { name: 'Sports', slug: 'sports', description: 'Sports and outdoor equipment' },
  { name: 'Toys', slug: 'toys', description: 'Toys and games' },
  { name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care' },
  { name: 'Food', slug: 'food', description: 'Food and beverages' }
]);

print('Database initialization completed successfully');
```

---

## Schema Design

### Optimized Product Schema

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    images: [{
      url: String,
      alt: String,
      isPrimary: { type: Boolean, default: false }
    }],
    price: { 
      type: Number, 
      required: true,
      min: 0,
      index: true
    },
    compareAtPrice: {
      type: Number,
      min: 0
    },
    description: { 
      type: String,
      maxlength: 5000
    },
    shortDescription: {
      type: String,
      maxlength: 500
    },
    specifications: {
      type: Map,
      of: String
    },
    inventory: {
      quantity: { 
        type: Number, 
        default: 0,
        min: 0,
        index: true
      },
      sku: {
        type: String,
        unique: true,
        sparse: true
      },
      lowStockThreshold: { 
        type: Number, 
        default: 10 
      },
      trackInventory: { 
        type: Boolean, 
        default: true 
      }
    },
    categories: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'ProductCategory',
      index: true
    }],
    shop: { 
      type: Schema.Types.ObjectId, 
      ref: 'Shop',
      required: true,
      index: true
    },
    reviews: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Review' 
    }],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [String],
    seo: {
      title: String,
      description: String,
      keywords: [String]
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Text index for search
productSchema.index({ 
  name: 'text', 
  description: 'text',
  shortDescription: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    shortDescription: 5,
    tags: 3,
    description: 1
  }
});

// Compound indexes for common queries
productSchema.index({ shop: 1, status: 1, created_at: -1 });
productSchema.index({ categories: 1, status: 1, price: 1 });
productSchema.index({ featured: 1, status: 1, created_at: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return !this.inventory.trackInventory || this.inventory.quantity > 0;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
```

### Optimized Order Schema

```javascript
const orderSchema = new Schema(
  {
    orderNumber: { 
      type: String, 
      unique: true, 
      required: true,
      index: true
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    items: [{
      product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
      },
      name: String, // Snapshot of product name
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      shop: { 
        type: Schema.Types.ObjectId, 
        ref: 'Shop',
        index: true
      },
      image: String // Snapshot of product image
    }],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: String,
      postCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    billingAddress: {
      fullName: String,
      address: String,
      city: String,
      province: String,
      postCode: String,
      country: String
    },
    paymentMethod: { 
      type: String, 
      enum: ['credit_card', 'paypal', 'cod', 'bank_transfer'],
      required: true 
    },
    paymentDetails: {
      transactionId: String,
      paymentGateway: String,
      last4: String // Last 4 digits of card
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
      index: true
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    couponCode: String,
    notes: String,
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    cancelReason: String,
    refundAmount: Number,
    refundReason: String
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'items.shop': 1, orderStatus: 1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
```

### Cart Schema

```javascript
const cartSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true,
      index: true
    },
    items: [{
      product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
      },
      quantity: { 
        type: Number, 
        required: true,
        min: 1,
        default: 1
      },
      price: Number, // Snapshot of price when added
      addedAt: { type: Date, default: Date.now }
    }],
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30*24*60*60*1000), // 30 days
      index: true
    }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically delete expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Cart', cartSchema);
```

---

## Indexing Strategy

### Index Types and Usage

1. **Single Field Indexes**
   ```javascript
   db.users.createIndex({ email: 1 }, { unique: true });
   db.products.createIndex({ price: 1 });
   ```

2. **Compound Indexes**
   ```javascript
   db.products.createIndex({ shop: 1, status: 1, created_at: -1 });
   db.orders.createIndex({ user: 1, createdAt: -1 });
   ```

3. **Text Indexes**
   ```javascript
   db.products.createIndex({ 
     name: 'text', 
     description: 'text' 
   }, {
     weights: { name: 10, description: 1 }
   });
   ```

4. **Geospatial Indexes** (for location-based features)
   ```javascript
   db.shops.createIndex({ location: '2dsphere' });
   ```

5. **TTL Indexes** (for automatic deletion)
   ```javascript
   db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
   ```

### Index Monitoring

```javascript
// Check existing indexes
db.products.getIndexes();

// Analyze index usage
db.products.aggregate([
  { $indexStats: {} }
]);

// Explain query execution
db.products.find({ price: { $gte: 100 } }).explain('executionStats');
```

---

## Performance Optimization

### 1. Connection Pooling

```javascript
// In your MongoDB connection file
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4
});
```

### 2. Query Optimization

```javascript
// Use projection to limit returned fields
Product.find({ status: 'active' })
  .select('name price images')
  .lean(); // Returns plain JavaScript objects (faster)

// Use pagination
Product.find({ status: 'active' })
  .skip(page * limit)
  .limit(limit)
  .sort({ created_at: -1 });

// Use aggregation for complex queries
Product.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$shop', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);
```

### 3. Caching Strategy

```javascript
// Use Redis for caching frequently accessed data
const redis = require('redis');
const client = redis.createClient();

async function getProduct(productId) {
  // Check cache first
  const cached = await client.get(`product:${productId}`);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const product = await Product.findById(productId);
  
  // Cache for 1 hour
  await client.setex(`product:${productId}`, 3600, JSON.stringify(product));
  
  return product;
}
```

### 4. Bulk Operations

```javascript
// Use bulkWrite for multiple operations
const operations = products.map(product => ({
  updateOne: {
    filter: { _id: product._id },
    update: { $set: { price: product.price } }
  }
}));

await Product.bulkWrite(operations);
```

---

## Backup & Restore

### Automated Backup Script

Create `backend/scripts/backup-mongodb.sh`:

```bash
#!/bin/bash

# MongoDB Backup Script
# Usage: ./backup-mongodb.sh

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="ecommerce_backup_$TIMESTAMP"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USER="admin"
MONGO_PASS="password"
MONGO_DB="ecommerce"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting MongoDB backup..."
mongodump \
  --host=$MONGO_HOST \
  --port=$MONGO_PORT \
  --username=$MONGO_USER \
  --password=$MONGO_PASS \
  --db=$MONGO_DB \
  --authenticationDatabase=admin \
  --out=$BACKUP_DIR/$BACKUP_NAME

# Compress backup
echo "Compressing backup..."
tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C $BACKUP_DIR $BACKUP_NAME
rm -rf $BACKUP_DIR/$BACKUP_NAME

# Keep only last 7 backups
echo "Cleaning old backups..."
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
```

### Restore Script

Create `backend/scripts/restore-mongodb.sh`:

```bash
#!/bin/bash

# MongoDB Restore Script
# Usage: ./restore-mongodb.sh <backup_file>

if [ -z "$1" ]; then
  echo "Usage: ./restore-mongodb.sh <backup_file.tar.gz>"
  exit 1
fi

BACKUP_FILE=$1
TEMP_DIR="./temp_restore"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USER="admin"
MONGO_PASS="password"
MONGO_DB="ecommerce"

# Extract backup
echo "Extracting backup..."
mkdir -p $TEMP_DIR
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restore database
echo "Restoring MongoDB..."
mongorestore \
  --host=$MONGO_HOST \
  --port=$MONGO_PORT \
  --username=$MONGO_USER \
  --password=$MONGO_PASS \
  --db=$MONGO_DB \
  --authenticationDatabase=admin \
  --drop \
  $TEMP_DIR/*/ecommerce

# Cleanup
rm -rf $TEMP_DIR

echo "Restore completed successfully"
```

### Automated Backup with Cron

```bash
# Add to crontab (crontab -e)
# Daily backup at 2 AM
0 2 * * * /path/to/backup-mongodb.sh >> /path/to/backup.log 2>&1
```

---

## Security Configuration

### 1. Enable Authentication

Already configured in docker-compose.yml with `--auth` flag.

### 2. Create Limited User

```javascript
// In mongo shell
use ecommerce;
db.createUser({
  user: "app_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "ecommerce" }
  ]
});
```

### 3. Network Security

```yaml
# In docker-compose.yml
services:
  mongo:
    networks:
      - ecommerce_network
    # Don't expose port in production, use internal network
```

### 4. Encryption at Rest

```yaml
# Add to mongo command in docker-compose.yml
command: >
  mongod 
  --auth
  --enableEncryption
  --encryptionKeyFile /etc/mongodb-keyfile
```

---

## Monitoring

### Health Check Endpoint

```javascript
// In Express app
app.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

### Performance Monitoring

```javascript
// Log slow queries
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

---

## Production Deployment

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free or paid cluster
   - Configure network access (whitelist IPs)

2. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

3. **Best Practices**
   - Enable automatic backups
   - Set up monitoring alerts
   - Use connection pooling
   - Enable encryption in transit

### Self-Hosted Production

```yaml
# Production docker-compose.yml
version: '3.8'

services:
  mongo:
    image: mongo:6.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - /data/mongodb:/data/db
      - /data/mongodb-config:/data/configdb
    command: >
      mongod 
      --auth
      --bind_ip_all
      --wiredTigerCacheSizeGB 2
    networks:
      - backend
    # Don't expose port publicly
    # Use reverse proxy or VPN

networks:
  backend:
    internal: true
```

---

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongo
   
   # Check logs
   docker logs ecommerce_mongodb
   ```

2. **Authentication Failed**
   ```bash
   # Verify credentials in .env match docker-compose.yml
   # Restart containers
   docker-compose down
   docker-compose up -d
   ```

3. **Slow Queries**
   ```javascript
   // Enable profiling
   db.setProfilingLevel(1, { slowms: 100 });
   
   // View slow queries
   db.system.profile.find().sort({ ts: -1 }).limit(10);
   ```

4. **Disk Space Issues**
   ```bash
   # Check disk usage
   docker exec ecommerce_mongodb df -h
   
   # Compact database
   docker exec ecommerce_mongodb mongosh --eval "db.runCommand({ compact: 'products' })"
   ```

---

## Maintenance Tasks

### Weekly Tasks
- [ ] Review slow query logs
- [ ] Check index usage
- [ ] Monitor disk space
- [ ] Review backup logs

### Monthly Tasks
- [ ] Analyze query patterns
- [ ] Optimize indexes
- [ ] Review and archive old data
- [ ] Update MongoDB version (if needed)
- [ ] Test backup restoration

### Quarterly Tasks
- [ ] Performance audit
- [ ] Security review
- [ ] Capacity planning
- [ ] Documentation update

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)