# 🚕 Taxi Platform - Complete Ecosystem

A modern, comprehensive taxi booking and management platform built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

## 🌟 Features

### 🏠 **Homepage**
- Professional landing page introducing the platform
- Feature highlights and benefits
- Call-to-action sections for both riders and drivers
- Responsive design with modern UI/UX

### 🚗 **For Riders** (`/riders`)
- **Interactive Map**: Real-time taxi locations using Leaflet maps
- **Live Taxi Tracking**: See available taxis with estimated arrival times
- **Smart Filtering**: Filter by availability, distance, and search by driver/vehicle
- **Transparent Pricing**: Multiple tariff options with clear pricing structure
- **Easy Booking**: Simple booking form with driver contact details
- **Responsive Design**: Works on desktop and mobile devices

### 👨‍💼 **For Drivers** (`/drivers`)
- **Company Registration**: Complete taxi company setup
- **Fleet Management**: Add and manage multiple vehicles
- **Driver Management**: Register and manage taxi drivers
- **Tariff Configuration**: Set up pricing structures and rates
- **Dashboard Overview**: Real-time statistics and quick actions
- **Document Management**: Handle licenses, insurance, and certifications

## 🏗️ **Architecture Overview**

### **Frontend Stack**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Maps**: Leaflet for interactive mapping
- **Icons**: Lucide React for consistent iconography

### **Key Components**
- `src/app/page.tsx` - Homepage with marketing content
- `src/app/riders/page.tsx` - Rider booking interface with map
- `src/app/drivers/page.tsx` - Driver/company management dashboard
- `src/app/components/TaxiMap.tsx` - Interactive map component

### **Data Structures**

#### **Taxi Company**
```typescript
interface Company {
  id: string
  name: string
  address: string
  taxNumber: string
  taxiLicenseNumber: string
  contactPerson: string
  email: string
  phone: string
  status: 'active' | 'pending' | 'suspended'
}
```

#### **Vehicle**
```typescript
interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
  taxiLicenseNumber: string
  insuranceExpiry: string
  keuringExpiry: string
  status: 'active' | 'maintenance' | 'inactive'
}
```

#### **Driver**
```typescript
interface Driver {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  taxiDriverLicense: string
  licenseExpiry: string
  vehicleId: string
  status: 'active' | 'inactive'
}
```

#### **Tariff System**
```typescript
interface Tariff {
  id: string
  name: string
  code: string
  type: 'meter_based' | 'fixed_based'
  startPrice: number
  pricePerKm: number
  pricePerMinute: number
  nightSurcharge: number
  isActive: boolean
}
```

#### **Real-time Taxi Tracking**
```typescript
interface Taxi {
  id: string
  driverId: string
  driverName: string
  vehicleId: string
  licensePlate: string
  currentLocation: {
    lat: number
    lng: number
    address: string
  }
  status: 'available' | 'busy' | 'offline'
  rating: number
  totalTrips: number
  estimatedArrival: number
  currentTariff: Tariff
}
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

### **Installation**
```bash
# Navigate to the project directory
cd dev-platform/taxi-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🌐 **Live Demo**

The platform runs on:
- **Local**: http://localhost:3000
- **Network**: http://192.168.0.83:3000 (accessible on local network)

### **Page Navigation**
- `/` - Homepage
- `/riders` - Rider booking interface
- `/drivers` - Driver/company management

## 🗺️ **Map Features**

### **Interactive Map Components**
- **User Location**: Blue circle showing rider's current position
- **Available Taxis**: Green taxi icons for available vehicles
- **Busy Taxis**: Gray taxi icons for occupied vehicles
- **Selected Taxi**: Highlighted with white border and red indicator
- **Real-time Updates**: Live position updates (simulated)

### **Map Controls**
- **Center on Location**: Button to return to user's position
- **Zoom Controls**: Standard map zoom in/out
- **Popup Information**: Detailed taxi info on marker click
- **Legend**: Visual guide for map symbols

## 📱 **Integration with DEV/shift-manager**

This platform is designed to integrate with your existing taxi meter app in `DEV/shift-manager`:

### **Authentication Flow**
1. Drivers register their company on this platform
2. Platform generates API credentials
3. Taxi meter app authenticates using these credentials
4. Only registered drivers can use the meter app

### **Data Synchronization**
- **Trip Logs**: Real-time sync from meter to platform
- **Driver Status**: Online/offline status updates
- **Location Updates**: GPS position streaming
- **Tariff Sync**: Pricing data synchronization

## 🔒 **Security Features**

- **Driver Verification**: License validation system
- **Vehicle Registration**: Insurance and inspection tracking
- **Secure Authentication**: JWT token-based authentication
- **Data Validation**: TypeScript type checking
- **Input Sanitization**: XSS protection

## 📊 **Future Enhancements**

### **Database Integration**
- **PostgreSQL/MySQL**: Production database setup
- **Prisma ORM**: Type-safe database operations
- **Real-time Sync**: WebSocket connections for live updates

### **Payment Integration**
- **Stripe/PayPal**: Secure payment processing
- **Wallet System**: Driver earnings management
- **Invoice Generation**: Automated billing

### **Advanced Features**
- **Route Optimization**: AI-powered dispatch
- **Analytics Dashboard**: Performance metrics
- **Mobile Apps**: Native iOS/Android applications
- **API Gateway**: RESTful API for third-party integrations

## 🛠️ **Technical Specifications**

### **Performance**
- **Fast Rendering**: Next.js App Router optimization
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Next.js image optimization
- **SEO Friendly**: Server-side rendering support

### **Responsive Design**
- **Mobile First**: Optimized for mobile devices
- **Desktop Support**: Full desktop functionality
- **Cross-browser**: Compatible with modern browsers
- **Accessibility**: ARIA labels and keyboard navigation

## 📞 **Support & Contact**

For technical support or feature requests:
- Create an issue in the project repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
