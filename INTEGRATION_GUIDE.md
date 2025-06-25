# 🚕 TAXI METER INTEGRATION GUIDE

## 🎯 Overview
This guide shows you how to integrate your existing taxi meter app (`DEV/shift-manager`) with the new taxi platform backend.

## 📋 Prerequisites
✅ Taxi platform running on `http://localhost:3000`  
✅ Database set up and working  
✅ API endpoints accessible  

## 🔧 Integration Steps

### 1. **Add HTTP Client to Taxi Meter App**

Add this to your `DEV/shift-manager/src/utils/api.js`:

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/taxi-meter';
let authToken = null;

// Store driver credentials (from login/registration)
let driverCredentials = {
    driverId: null,
    vehicleId: null,
    companyId: null
};

// Authentication
export async function authenticateDriver(driverId, vehicleId) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId, vehicleId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            driverCredentials = { driverId, vehicleId, companyId: data.companyId };
            return { success: true, data };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Location tracking
export async function updateLocation(latitude, longitude, heading = null, speed = null) {
    if (!authToken || !driverCredentials.driverId) {
        console.warn('Driver not authenticated for location updates');
        return;
    }
    
    try {
        await fetch(`${API_BASE_URL}/location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                driverId: driverCredentials.driverId,
                latitude,
                longitude,
                heading,
                speed
            })
        });
    } catch (error) {
        console.error('Location update failed:', error);
    }
}

// Trip logging
export async function logTrip(tripData) {
    if (!authToken || !driverCredentials.driverId) {
        console.error('Driver not authenticated for trip logging');
        return { success: false, error: 'Not authenticated' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/trips`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                driverId: driverCredentials.driverId,
                vehicleId: driverCredentials.vehicleId,
                ...tripData
            })
        });
        
        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get nearby ride requests
export async function getNearbyRequests() {
    if (!authToken) return { success: false, error: 'Not authenticated' };
    
    try {
        const response = await fetch(`${API_BASE_URL}/requests/nearby`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        return { success: response.ok, data: data.requests || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### 2. **Modify Your Taxi Meter Component**

Update your main taxi meter component:

```javascript
// In your main taxi meter component
import { authenticateDriver, updateLocation, logTrip } from '../utils/api.js';

export default function TaxiMeter() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentTrip, setCurrentTrip] = useState(null);
    
    // On app startup - authenticate driver
    useEffect(() => {
        async function authenticate() {
            // Get driver credentials from your app's storage/login
            const driverId = localStorage.getItem('driverId') || 'driver-001';
            const vehicleId = localStorage.getItem('vehicleId') || 'vehicle-001';
            
            const result = await authenticateDriver(driverId, vehicleId);
            if (result.success) {
                setIsAuthenticated(true);
                console.log('Driver authenticated successfully');
            } else {
                console.error('Authentication failed:', result.error);
                // Handle authentication failure (redirect to login, etc.)
            }
        }
        
        authenticate();
    }, []);
    
    // Location tracking
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const locationInterval = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    updateLocation(
                        position.coords.latitude,
                        position.coords.longitude,
                        position.coords.heading,
                        position.coords.speed
                    );
                });
            }
        }, 10000); // Update every 10 seconds
        
        return () => clearInterval(locationInterval);
    }, [isAuthenticated]);
    
    // When trip ends, log it to the platform
    const handleTripEnd = async (tripData) => {
        const result = await logTrip({
            startTime: tripData.startTime,
            endTime: new Date().toISOString(),
            distance: tripData.totalDistance,
            fare: tripData.totalFare,
            tariffId: tripData.tariffType,
            pickupAddress: tripData.pickupLocation,
            dropoffAddress: tripData.dropoffLocation,
            governmentData: {
                // Your existing government API data
                tripId: tripData.governmentTripId,
                fiscalData: tripData.fiscalReceipt
            }
        });
        
        if (result.success) {
            console.log('Trip logged successfully');
        } else {
            console.error('Trip logging failed:', result.error);
        }
    };
    
    // Rest of your taxi meter component...
}
```

### 3. **Driver Registration Flow**

Add this to handle new driver registration:

```javascript
// Driver registration component
export function DriverRegistration() {
    const handleRegistration = async (formData) => {
        try {
            const response = await fetch('http://localhost:3000/api/drivers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    licenseNumber: formData.licenseNumber,
                    phone: formData.phone,
                    vehicleId: formData.vehicleId,
                    companyId: formData.companyId
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store credentials for future use
                localStorage.setItem('driverId', data.driver.id);
                localStorage.setItem('vehicleId', formData.vehicleId);
                
                // Redirect to taxi meter
                window.location.href = '/taxi-meter';
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };
    
    // Your registration form JSX...
}
```

## 🔐 Security Implementation

### 1. **Environment Configuration**

Add to your taxi meter app's environment:

```javascript
// In your app's config
const config = {
    API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-platform-domain.com/api/taxi-meter'
        : 'http://localhost:3000/api/taxi-meter',
    
    // Government API settings
    GOVERNMENT_API_URL: process.env.GOVERNMENT_API_URL,
    GOVERNMENT_API_KEY: process.env.GOVERNMENT_API_KEY
};
```

### 2. **Error Handling**

```javascript
// Enhanced error handling
class TaxiMeterAPI {
    static async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, re-authenticate
                    await this.reAuthenticate();
                    return this.makeRequest(endpoint, options);
                }
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    static async reAuthenticate() {
        const driverId = localStorage.getItem('driverId');
        const vehicleId = localStorage.getItem('vehicleId');
        
        if (driverId && vehicleId) {
            await authenticateDriver(driverId, vehicleId);
        }
    }
}
```

## 🚀 Testing Integration

### 1. **Test Authentication**
```bash
# In your taxi meter app directory
cd DEV/shift-manager
npm install # if needed
npm start
```

### 2. **Test API Endpoints**
```bash
# In the platform directory
cd dev-platform/taxi-platform
node test-api.js
```

### 3. **Monitor Logs**
- Check browser console for API responses
- Monitor network tab for API calls
- Check taxi platform logs for incoming requests

## 📱 Mobile/Cordova Integration

For your Android Cordova build:

```javascript
// In your Cordova app's config.xml, add:
<access origin="http://localhost:3000" />
<access origin="https://your-platform-domain.com" />

// Handle Cordova device ready
document.addEventListener('deviceready', function() {
    // Initialize API connection
    authenticateDriver(deviceDriverId, deviceVehicleId);
}, false);
```

## 🎯 Next Steps

1. **Test the integration** with your existing taxi meter
2. **Add driver registration** to your app
3. **Test trip logging** end-to-end
4. **Deploy to production** when ready

## 🆘 Troubleshooting

**Authentication Issues:**
- Check if platform is running on http://localhost:3000
- Verify driver exists in database
- Check JWT token in browser storage

**Location Updates Failing:**
- Ensure GPS permissions granted
- Check network connectivity
- Verify authentication token validity

**Trip Logging Issues:**
- Ensure all required fields are provided
- Check date formats (ISO strings)
- Verify government API integration

---

🎉 **Your taxi meter is now connected to the platform!** Drivers can now be tracked, trips logged, and rides coordinated through the central system. 