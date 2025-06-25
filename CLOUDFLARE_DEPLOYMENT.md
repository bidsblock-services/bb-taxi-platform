# 🚀 CLOUDFLARE PAGES DEPLOYMENT GUIDE

## 🎯 Domain: bb-platform.pages.dev

### 📋 Prerequisites

1. **Cloudflare Account** with Pages enabled
2. **GitHub Repository** connected to Cloudflare Pages
3. **Cloudflare D1 Database** (for API functionality)

---

## 🔧 Step 1: Setup Cloudflare D1 Database

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create taxi-platform-db

# Note the database ID from the output and update wrangler.toml
```

## 📊 Step 2: Deploy Database Schema

```sql
-- Run this SQL in your D1 database console
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  taxNumber TEXT UNIQUE NOT NULL,
  taxiLicenseNumber TEXT UNIQUE NOT NULL,
  contactPersonName TEXT NOT NULL,
  contactPersonEmail TEXT NOT NULL,
  contactPersonPhone TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  licensePlate TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  taxiLicenseNumber TEXT NOT NULL,
  insuranceExpiry DATETIME NOT NULL,
  keuringExpiry DATETIME NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id)
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'RIDER',
  phone TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  companyId TEXT NOT NULL,
  vehicleId TEXT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  taxiDriverLicense TEXT UNIQUE NOT NULL,
  licenseExpiry DATETIME NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
);

CREATE TABLE location_updates (
  id TEXT PRIMARY KEY,
  driverId TEXT NOT NULL,
  vehicleId TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  heading REAL,
  speed REAL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driverId) REFERENCES drivers(id),
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
);

CREATE TABLE trip_logs (
  id TEXT PRIMARY KEY,
  logType TEXT NOT NULL,
  companyId TEXT NOT NULL,
  vehicleId TEXT,
  driverId TEXT,
  distance REAL,
  finalPrice REAL,
  tariffUsed TEXT,
  tripStartTime DATETIME,
  tripEndTime DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  FOREIGN KEY (driverId) REFERENCES drivers(id)
);
```

## 🌐 Step 3: Cloudflare Pages Setup

### Build Configuration in Cloudflare Pages Dashboard:

- **Framework preset**: Next.js
- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node.js version**: `18.17.0`

### Environment Variables:

Add these in Cloudflare Pages Settings > Environment Variables:

```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-here
GOVERNMENT_API_URL=https://api.government.be/taxi
GOVERNMENT_API_KEY=your-government-api-key-here
```

## 🔗 Step 4: D1 Database Binding

In your Cloudflare Pages project settings:

1. Go to **Settings** > **Functions**
2. Add **D1 database binding**:
   - Variable name: `DB`
   - D1 database: Select your `taxi-platform-db`

## 📱 Step 5: Update Your Taxi Meter App

Update the API URL in your taxi meter app:

```javascript
// Replace localhost with your Cloudflare domain
const API_BASE_URL = 'https://bb-platform.pages.dev/api/taxi-meter';

// Your existing integration code remains the same
async function authenticateDriver() {
    const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            driverId: 'your-driver-id',
            vehicleId: 'your-vehicle-id'
        })
    });
    // ... rest of your code
}
```

## 🚀 Step 6: Deploy

1. **Push to GitHub**: All files are ready for deployment
2. **Connect Repository**: Link your GitHub repo to Cloudflare Pages
3. **Deploy**: Cloudflare will automatically build and deploy

## 🔧 Post-Deployment

### Test Your APIs:

```bash
# Test authentication
curl -X POST https://bb-platform.pages.dev/api/taxi-meter/auth \
  -H "Content-Type: application/json" \
  -d '{"driverId":"test-id","vehicleId":"test-vehicle"}'

# Test location update
curl -X POST https://bb-platform.pages.dev/api/taxi-meter/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"driverId":"test-id","latitude":50.8503,"longitude":4.3517}'
```

## 📋 Seed Data Script for D1

Run this to add test data:

```sql
-- Insert test company
INSERT INTO companies (id, name, address, taxNumber, taxiLicenseNumber, contactPersonName, contactPersonEmail, contactPersonPhone, email, phone, status) 
VALUES ('cm-company-1', 'Brussels Taxi Co.', 'Rue de la Loi 100, 1000 Brussels', 'BE0123456789', 'TC-BRU-001', 'John Doe', 'john@brusselstaxi.be', '+32 2 123 4567', 'info@brusselstaxi.be', '+32 2 123 4567', 'ACTIVE');

-- Insert test vehicle
INSERT INTO vehicles (id, companyId, licensePlate, brand, model, year, color, taxiLicenseNumber, insuranceExpiry, keuringExpiry, status) 
VALUES ('cm-vehicle-1', 'cm-company-1', 'ABC-123', 'Mercedes', 'E-Class', 2022, 'Black', 'TXI-001', '2024-12-31', '2024-12-31', 'ACTIVE');

-- Insert test user
INSERT INTO users (id, name, email, role, phone) 
VALUES ('cm-user-1', 'Jan Janssen', 'jan@brusselstaxi.be', 'DRIVER', '+32 477 123 456');

-- Insert test driver
INSERT INTO drivers (id, userId, companyId, vehicleId, firstName, lastName, taxiDriverLicense, licenseExpiry, address, phone, email, status) 
VALUES ('cm-driver-1', 'cm-user-1', 'cm-company-1', 'cm-vehicle-1', 'Jan', 'Janssen', 'DL-001-2023', '2026-12-31', 'Chaussée de Louvain 10, 1000 Brussels', '+32 477 123 456', 'jan@brusselstaxi.be', 'ACTIVE');
```

---

## ✅ Your Taxi Platform URLs:

- **Website**: https://bb-platform.pages.dev
- **Riders**: https://bb-platform.pages.dev/riders
- **Drivers**: https://bb-platform.pages.dev/drivers
- **API**: https://bb-platform.pages.dev/api/taxi-meter/*

## 🆘 Troubleshooting:

- **API not working**: Check D1 database binding in Cloudflare Pages
- **CORS errors**: Verify `_headers` file is in the build output
- **Build failures**: Check Node.js version is set to 18.17.0

🎉 **Your taxi platform is ready for production on Cloudflare!** 