// Test script for Taxi Meter API endpoints
const BASE_URL = 'http://localhost:3000';

async function testTaxiMeterAPI() {
    console.log('🧪 Testing Taxi Meter API Endpoints...\n');
    
    try {
        // Test 1: Authentication endpoint
        console.log('1. Testing Authentication Endpoint...');
        const authResponse = await fetch(`${BASE_URL}/api/taxi-meter/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverId: 'test-driver-001',
                vehicleId: 'test-vehicle-001'
            })
        });
        
        if (authResponse.ok) {
            console.log('✅ Auth endpoint is working');
            const authData = await authResponse.json();
            console.log('   Response:', authData.message);
        } else {
            console.log('❌ Auth endpoint failed:', authResponse.status, authResponse.statusText);
        }
        
        // Test 2: Location endpoint
        console.log('\n2. Testing Location Endpoint...');
        const locationResponse = await fetch(`${BASE_URL}/api/taxi-meter/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverId: 'test-driver-001',
                latitude: 50.8503,
                longitude: 4.3517,
                heading: 45,
                speed: 30
            })
        });
        
        if (locationResponse.ok) {
            console.log('✅ Location endpoint is working');
            const locationData = await locationResponse.json();
            console.log('   Response:', locationData.message);
        } else {
            console.log('❌ Location endpoint failed:', locationResponse.status, locationResponse.statusText);
        }
        
        // Test 3: Trip logging endpoint
        console.log('\n3. Testing Trip Logging Endpoint...');
        const tripResponse = await fetch(`${BASE_URL}/api/taxi-meter/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverId: 'test-driver-001',
                vehicleId: 'test-vehicle-001',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 1800000).toISOString(), // 30 minutes later
                distance: 12.5,
                fare: 25.50,
                tariffId: 'standard-day',
                pickupAddress: 'Brussels Central Station',
                dropoffAddress: 'Brussels Airport'
            })
        });
        
        if (tripResponse.ok) {
            console.log('✅ Trip logging endpoint is working');
            const tripData = await tripResponse.json();
            console.log('   Response:', tripData.message);
        } else {
            console.log('❌ Trip logging endpoint failed:', tripResponse.status, tripResponse.statusText);
        }
        
        console.log('\n🎉 API Tests Complete!');
        console.log('\n📋 Next Steps:');
        console.log('1. Open http://localhost:3000 in your browser');
        console.log('2. Test the homepage, riders page, and drivers page');
        console.log('3. Integrate with your taxi meter app in DEV/shift-manager');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the tests if node is available
if (typeof fetch === 'undefined') {
    console.log('To run this test, install node-fetch or use Node.js 18+');
} else {
    testTaxiMeterAPI();
}

module.exports = { testTaxiMeterAPI }; 