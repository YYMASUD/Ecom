# Environment Configuration Guide

This document provides detailed instructions for setting up environment variables and configuration files for the e-commerce platform.

---

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following configuration:

### Template: `backend/.env`

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Development (Docker)
MONGODB_URI=mongodb://admin:password@localhost:27017/ecommerce?authSource=admin

# Production (MongoDB Atlas example)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# Database credentials (for Docker Compose)
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=ecommerce

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# CORS CONFIGURATION
# ============================================
# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8000

# Additional allowed origins (comma-separated)
# ALLOWED_ORIGINS=http://localhost:8000,https://yourdomain.com

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
# Maximum file size in bytes (5MB default)
MAX_FILE_SIZE=5242880

# Upload directory path
UPLOAD_PATH=./uploads

# Allowed file types (comma-separated)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================
# SMTP settings for email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# ============================================
# PAYMENT GATEWAY CONFIGURATION (Optional)
# ============================================
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# ============================================
# SECURITY CONFIGURATION
# ============================================
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session configuration
SESSION_SECRET=your-session-secret-key

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# ============================================
# REDIS CONFIGURATION (Optional - for caching)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# AWS S3 CONFIGURATION (Optional - for file storage)
# ============================================
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# ============================================
# MONITORING & ANALYTICS (Optional)
# ============================================
# Sentry for error tracking
SENTRY_DSN=your_sentry_dsn

# Google Analytics
GA_TRACKING_ID=UA-XXXXXXXXX-X
```

---

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following configuration:

### Template: `frontend/.env`

```env
# ============================================
# API CONFIGURATION
# ============================================
# Backend API URL
VITE_BACKENDURL=http://localhost:3000

# API timeout (milliseconds)
VITE_API_TIMEOUT=30000

# ============================================
# PAYMENT CONFIGURATION
# ============================================
# Stripe publishable key (client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal client ID (client-side)
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# ============================================
# FEATURE FLAGS
# ============================================
# Enable/disable features
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_PRODUCT_COMPARISON=true
VITE_ENABLE_LIVE_CHAT=false

# ============================================
# ANALYTICS & TRACKING
# ============================================
# Google Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Facebook Pixel
VITE_FB_PIXEL_ID=your_facebook_pixel_id

# ============================================
# CDN & ASSETS
# ============================================
# CDN URL for static assets (optional)
VITE_CDN_URL=https://cdn.yourdomain.com

# Default product image
VITE_DEFAULT_PRODUCT_IMAGE=/images/placeholder.jpg

# ============================================
# APP CONFIGURATION
# ============================================
# App name
VITE_APP_NAME=E-Commerce Platform

# App version
VITE_APP_VERSION=2.0.0

# Support email
VITE_SUPPORT_EMAIL=support@yourdomain.com

# ============================================
# DEVELOPMENT CONFIGURATION
# ============================================
# Enable debug mode
VITE_DEBUG=true

# Mock API responses (for testing)
VITE_MOCK_API=false
```

---

## Docker Compose Environment Variables

For Docker Compose, you can also use a `.env` file in the `backend/` directory:

### Template: `backend/.env` (Docker-specific)

```env
# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=change-this-secure-password
MONGO_INITDB_DATABASE=ecommerce

# Mongo Express Configuration
MONGO_EXPRESS_USER=admin
MONGO_EXPRESS_PASSWORD=change-this-password

# MongoDB Connection String
MONGODB_URI=mongodb://admin:change-this-secure-password@mongo:27017/ecommerce?authSource=admin
```

---

## Production Environment Variables

### Security Considerations for Production

1. **Strong Secrets**: Use cryptographically secure random strings
   ```bash
   # Generate secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Environment-Specific Values**:
   - Use production MongoDB URI (MongoDB Atlas recommended)
   - Use production frontend URL (HTTPS)
   - Enable secure cookies
   - Set NODE_ENV=production

3. **Sensitive Data**:
   - Never commit `.env` files to version control
   - Use environment variable management services (AWS Secrets Manager, HashiCorp Vault)
   - Rotate secrets regularly

### Production `.env` Example

```env
# Production Configuration
NODE_ENV=production
PORT=3000

# Production Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://prod_user:secure_password@cluster.mongodb.net/ecommerce_prod?retryWrites=true&w=majority

# Strong JWT Secret (64+ characters)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Production Frontend URL
FRONTEND_URL=https://yourdomain.com

# Production CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Production Email (SendGrid example)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key

# Production Payment Keys
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
PAYPAL_MODE=live

# Production Monitoring
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
```

---

## Environment Variable Loading

### Backend (Node.js)

The backend uses the `dotenv` package to load environment variables:

```javascript
// In app.js or server entry point
require('dotenv').config();

// Access variables
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
```

### Frontend (Vite)

Vite automatically loads environment variables prefixed with `VITE_`:

```javascript
// In Vue components or JavaScript files
const apiUrl = import.meta.env.VITE_BACKENDURL;
const appName = import.meta.env.VITE_APP_NAME;
```

**Important**: Only `VITE_` prefixed variables are exposed to the client-side code.

---

## Validation

### Backend Environment Validation

Add validation to ensure required environment variables are set:

```javascript
// config/validateEnv.js
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✓ All required environment variables are set');
}

module.exports = validateEnv;
```

### Frontend Environment Validation

```javascript
// src/config/validateEnv.js
const requiredEnvVars = [
  'VITE_BACKENDURL'
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}
```

---

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
VITE_DEBUG=true
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
VITE_DEBUG=true
LOG_LEVEL=info
```

### Production

```env
NODE_ENV=production
VITE_DEBUG=false
LOG_LEVEL=error
```

---

## Quick Setup Commands

### Initial Setup

```bash
# Backend
cd backend
cp .env.example .env
nano .env  # Edit with your values

# Frontend
cd frontend
cp .env.example .env
nano .env  # Edit with your values
```

### Verify Configuration

```bash
# Backend - Check if MongoDB connection works
cd backend
npm run test:db

# Frontend - Check if API connection works
cd frontend
npm run dev
# Open browser and check console for errors
```

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running: `docker ps`
   - Verify MONGODB_URI format
   - Ensure credentials match docker-compose.yml

2. **CORS Errors**
   - Verify FRONTEND_URL matches your frontend URL exactly
   - Check for trailing slashes
   - Ensure CORS is configured in backend

3. **JWT Errors**
   - Ensure JWT_SECRET is set and consistent
   - Check token expiration settings
   - Verify token format in requests

4. **File Upload Errors**
   - Check UPLOAD_PATH exists and is writable
   - Verify MAX_FILE_SIZE is appropriate
   - Ensure ALLOWED_FILE_TYPES includes your file type

---

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] Production secrets are strong and unique
- [ ] JWT_SECRET is at least 32 characters
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] File upload limits are set
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled in production
- [ ] Environment variables are validated on startup
- [ ] Sensitive data is not logged

---

## Additional Resources

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MongoDB Connection String](https://docs.mongodb.com/manual/reference/connection-string/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)