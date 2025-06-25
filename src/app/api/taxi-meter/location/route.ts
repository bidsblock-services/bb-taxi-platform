import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Middleware to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    throw new Error('Token required')
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// POST - Update driver location
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)
    const locationData = await request.json()

    const {
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      altitude
    } = locationData

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Update driver's current location
    await db.driver.update({
      where: { id: decoded.driverId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationUpdate: new Date()
      }
    })

    // Store detailed location update
    const locationUpdate = await db.locationUpdate.create({
      data: {
        driverId: decoded.driverId,
        vehicleId: decoded.vehicleId,
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        altitude
      }
    })

    // Broadcast location update to all connected clients via WebSocket
    // This would integrate with your WebSocket server
    await broadcastLocationUpdate({
      driverId: decoded.driverId,
      vehicleId: decoded.vehicleId,
      companyId: decoded.companyId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      timestamp: new Date()
    })

    return NextResponse.json({
      id: locationUpdate.id,
      message: 'Location updated successfully'
    })

  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Token') ? 401 : 500 }
    )
  }
}

// GET - Get nearby drivers (for riders)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseInt(searchParams.get('radius') || '10') // km

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Find online drivers within radius
    const onlineDrivers = await db.driver.findMany({
      where: {
        isOnline: true,
        status: 'ACTIVE',
        currentLatitude: { not: null },
        currentLongitude: { not: null },
        lastLocationUpdate: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            color: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Calculate distance and filter by radius
    const nearbyDrivers = onlineDrivers
      .map(driver => {
        const distance = calculateDistance(
          lat, lng,
          driver.currentLatitude!, driver.currentLongitude!
        )
        
        return {
          id: driver.id,
          name: `${driver.firstName} ${driver.lastName}`,
          phone: driver.phone,
          location: {
            latitude: driver.currentLatitude,
            longitude: driver.currentLongitude,
            lastUpdate: driver.lastLocationUpdate
          },
          distance: Math.round(distance * 100) / 100, // Round to 2 decimals
          estimatedArrival: Math.ceil(distance * 2), // Rough estimate: 2 minutes per km
          vehicle: driver.vehicle,
          company: driver.company,
          status: 'available'
        }
      })
      .filter(driver => driver.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      drivers: nearbyDrivers,
      count: nearbyDrivers.length,
      center: { lat, lng },
      radius
    })

  } catch (error) {
    console.error('Nearby drivers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// WebSocket broadcast function (placeholder)
async function broadcastLocationUpdate(locationData: any) {
  // This would integrate with your WebSocket server
  // For now, we'll just log it
  console.log('Broadcasting location update:', locationData)
  
  // In a real implementation, you would:
  // 1. Get WebSocket server instance
  // 2. Emit to rooms based on location/company
  // 3. Update any active booking requests
  
  // Example implementation:
  // io.to(`company_${locationData.companyId}`).emit('driverLocationUpdate', locationData)
  // io.to(`location_${Math.floor(locationData.latitude)}_${Math.floor(locationData.longitude)}`).emit('nearbyDriverUpdate', locationData)
} 