// Cloudflare Function for Taxi Meter API
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/taxi-meter', '');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Database connection (you'll need to configure D1 database)
    const db = env.DB; // Cloudflare D1 database binding
    
    // Authentication endpoint
    if (path === '/auth' && request.method === 'POST') {
      const { driverId, vehicleId } = await request.json();
      
      // Verify driver exists in database
      const driver = await db.prepare(
        'SELECT d.*, c.id as companyId FROM drivers d JOIN companies c ON d.companyId = c.id WHERE d.id = ? AND d.vehicleId = ?'
      ).bind(driverId, vehicleId).first();
      
      if (!driver) {
        return new Response(JSON.stringify({ error: 'Driver not found or not authorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Generate JWT token (simplified for demo)
      const token = btoa(JSON.stringify({ driverId, vehicleId, exp: Date.now() + 86400000 }));
      
      return new Response(JSON.stringify({
        success: true,
        token,
        driver: {
          id: driver.id,
          name: `${driver.firstName} ${driver.lastName}`,
          vehicleId: driver.vehicleId,
          companyId: driver.companyId
        },
        message: 'Authentication successful'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Location update endpoint
    if (path === '/location' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'No authorization token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      const { driverId, latitude, longitude, heading, speed } = await request.json();
      
      // Store location update
      await db.prepare(
        'INSERT INTO location_updates (id, driverId, vehicleId, latitude, longitude, heading, speed, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        generateId(),
        driverId,
        (await db.prepare('SELECT vehicleId FROM drivers WHERE id = ?').bind(driverId).first())?.vehicleId,
        latitude,
        longitude,
        heading || null,
        speed || null,
        new Date().toISOString()
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Location updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Trip logging endpoint
    if (path === '/trips' && request.method === 'POST') {
      const tripData = await request.json();
      
      // Store trip log
      await db.prepare(
        'INSERT INTO trip_logs (id, logType, companyId, vehicleId, driverId, startLatitude, startLongitude, endLatitude, endLongitude, distance, finalPrice, tariffUsed, tripStartTime, tripEndTime, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        generateId(),
        'TRIP_END',
        (await db.prepare('SELECT companyId FROM drivers WHERE id = ?').bind(tripData.driverId).first())?.companyId,
        tripData.vehicleId,
        tripData.driverId,
        null, // startLatitude - you can add GPS coordinates
        null, // startLongitude
        null, // endLatitude
        null, // endLongitude
        tripData.distance,
        tripData.fare,
        tripData.tariffId,
        tripData.startTime,
        tripData.endTime,
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Trip logged successfully',
        tripId: generateId()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

function generateId() {
  return 'cm' + Math.random().toString(36).substr(2, 15);
} 