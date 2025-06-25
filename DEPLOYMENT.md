# 🚀 Taxi Platform - Production Deployment Guide

This guide covers the complete deployment process for the Taxi Platform, including database setup, authentication, API integration, and production deployment.

## 📋 Prerequisites

### System Requirements
- **Docker** & **Docker Compose** installed
- **Node.js 18+** for local development
- **PostgreSQL 15+** (if not using Docker)
- **Redis** (if not using Docker)
- **SSL Certificate** for HTTPS (recommended)

### Environment Variables
Create `.env.production` file with the following:

```bash
# Database
POSTGRES_PASSWORD=your_secure_postgres_password

# Authentication
NEXTAUTH_SECRET=your_super_secret_nextauth_key_64_chars_minimum
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Government API Integration
GOVERNMENT_API_BASE_URL=https://api.government.be/taxi
GOVERNMENT_API_KEY=your_government_api_key

# Email Configuration (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=TaxiPlatform <noreply@taxiplatform.com>
```

## 🗄️ Database Setup

### 1. Using Docker (Recommended)
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to start
sleep 10

# Run migrations
npm run db:deploy

# Seed database (optional)
npm run db:seed
```

### 2. Manual Setup
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE taxi_platform;
CREATE USER taxi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taxi_platform TO taxi_user;
\q

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://taxi_user:password@localhost:5432/taxi_platform?schema=public"

# Run migrations
npx prisma migrate deploy
```

## 🔐 Authentication Setup

### 1. NextAuth.js Configuration
The platform uses NextAuth.js with multiple providers:
- **Credentials Provider**: Email/password authentication
- **Google OAuth**: Social login (optional)

### 2. Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (development)

### 3. User Roles
- **ADMIN**: Platform administration
- **COMPANY_ADMIN**: Company management
- **DRIVER**: Taxi drivers
- **RIDER**: Regular users

## 🚕 Taxi Meter App Integration

### 1. API Endpoints for DEV/shift-manager
Your taxi meter app should integrate with these endpoints:

#### Authentication
```typescript
// Login (POST /api/taxi-meter/auth)
const response = await fetch('/api/taxi-meter/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'driver@company.com',
    password: 'password123',
    deviceId: 'unique_device_id'
  })
})

const { token, driver } = await response.json()
```

#### Trip Logging
```typescript
// Log trip (POST /api/taxi-meter/trips)
const response = await fetch('/api/taxi-meter/trips', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    logType: 'TRIP_START',
    startLatitude: 50.8503,
    startLongitude: 4.3517,
    startAddress: 'Brussels Central',
    tariffUsed: 'A',
    tripStartTime: new Date().toISOString()
  })
})
```

#### Location Updates
```typescript
// Update location (POST /api/taxi-meter/location)
const response = await fetch('/api/taxi-meter/location', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    latitude: 50.8503,
    longitude: 4.3517,
    accuracy: 10,
    speed: 50,
    heading: 180
  })
})
```

### 2. Restricting Taxi Meter App Access
Only registered drivers can access the taxi meter app:
1. Driver must be registered on the platform
2. Company must be active
3. Driver status must be 'ACTIVE'
4. Valid JWT token required for all API calls

## 🌐 Real-time Features

### WebSocket Integration
The platform supports real-time features:
- **Live location tracking**
- **Booking notifications**
- **Driver status updates**
- **Trip progress monitoring**

```typescript
// Example WebSocket client integration
import io from 'socket.io-client'

const socket = io('wss://yourdomain.com')

// Join driver room
socket.emit('join_driver', { driverId: 'driver_id' })

// Listen for booking requests
socket.on('new_booking', (booking) => {
  console.log('New booking:', booking)
})

// Send location updates
socket.emit('location_update', {
  latitude: 50.8503,
  longitude: 4.3517
})
```

## 🚀 Production Deployment

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Clone and setup
git clone <your-repo>
cd taxi-platform

# 2. Create production environment
cp .env.example .env.production
# Edit .env.production with your values

# 3. Deploy with one command
npm run deploy
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Build application
npm run build

# 4. Run migrations
npm run db:deploy

# 5. Start production server
npm start
```

### Option 3: Cloud Deployment

#### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### AWS/DigitalOcean/Heroku
1. Use Docker deployment method
2. Configure cloud database (AWS RDS, DigitalOcean Database)
3. Set up load balancer and SSL

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong passwords and secrets
- Rotate API keys regularly

### 2. Database Security
- Use SSL connections in production
- Regular backups
- Monitor for unusual activity

### 3. API Security
- Rate limiting implemented
- JWT token expiration (24h)
- Input validation and sanitization

### 4. HTTPS/SSL
- Required for production
- Use Let's Encrypt for free certificates
- Enforce HTTPS redirects

## 📊 Monitoring & Maintenance

### 1. Application Monitoring
```bash
# Monitor logs
docker-compose logs -f app

# Check health
curl https://yourdomain.com/api/health

# Database status
npm run db:studio
```

### 2. Database Maintenance
```bash
# Backup database
pg_dump taxi_platform > backup_$(date +%Y%m%d).sql

# Monitor performance
SELECT * FROM pg_stat_activity;
```

### 3. Performance Optimization
- Enable Redis caching
- Optimize database queries
- Use CDN for static assets
- Implement database indexing

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database (CAUTION: destroys data)
docker-compose down -v
docker-compose up -d postgres
npm run db:deploy
```

#### Authentication Issues
```bash
# Verify NextAuth configuration
curl -X POST https://yourdomain.com/api/auth/signin

# Check JWT secret
echo $NEXTAUTH_SECRET | wc -c  # Should be > 32 characters
```

#### API Integration Issues
```bash
# Test taxi meter authentication
curl -X POST https://yourdomain.com/api/taxi-meter/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com","password":"test123"}'

# Check logs for API errors
docker-compose logs -f app | grep "API error"
```

## 📞 Support & Updates

### Getting Help
- Check logs: `docker-compose logs -f`
- Database issues: `npm run db:studio`
- API testing: Use Postman or curl

### Updating the Platform
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
npm run deploy

# Run new migrations if any
npm run db:deploy
```

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database setup and migrated
- [ ] SSL certificate installed
- [ ] Google OAuth configured (if using)
- [ ] Government API credentials set
- [ ] Docker containers running
- [ ] API endpoints tested
- [ ] Real-time features working
- [ ] Taxi meter app integrated
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Security review completed

**Your taxi platform is now ready for production! 🚕✨** 