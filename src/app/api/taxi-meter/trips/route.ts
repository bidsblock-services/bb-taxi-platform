import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

// Note: dynamic and runtime exports removed for static build compatibility

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

// POST - Create trip log
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)
    const tripData = await request.json()

    const {
      logType,
      parentId,
      startLatitude,
      startLongitude,
      startAddress,
      endLatitude,
      endLongitude,
      endAddress,
      distance,
      duration,
      finalPrice,
      tariffUsed,
      tripStartTime,
      tripEndTime,
      logDetails
    } = tripData

    // Create trip log
    const tripLog = await db.tripLog.create({
      data: {
        logType,
        parentId,
        companyId: decoded.companyId,
        vehicleId: decoded.vehicleId,
        driverId: decoded.driverId,
        userId: decoded.userId,
        startLatitude,
        startLongitude,
        startAddress,
        endLatitude,
        endLongitude,
        endAddress,
        distance,
        duration,
        finalPrice,
        tariffUsed,
        tripStartTime: tripStartTime ? new Date(tripStartTime) : null,
        tripEndTime: tripEndTime ? new Date(tripEndTime) : null,
        logDetails
      }
    })

    // If this is a trip start, send to government API
    if (logType === 'TRIP_START') {
      try {
        await sendToGovernmentAPI(tripLog.id, 'TRIP_START', {
          driverId: decoded.driverId,
          vehicleId: decoded.vehicleId,
          startTime: tripStartTime,
          startLocation: { latitude: startLatitude, longitude: startLongitude },
          tariff: tariffUsed
        })
        
        await db.tripLog.update({
          where: { id: tripLog.id },
          data: { tripStartApiSent: true }
        })
      } catch (apiError) {
        console.error('Government API error:', apiError)
        await db.tripLog.update({
          where: { id: tripLog.id },
          data: { apiErrorLog: String(apiError) }
        })
      }
    }

    // If this is a trip end, send to government API
    if (logType === 'TRIP_END') {
      try {
        await sendToGovernmentAPI(tripLog.id, 'TRIP_END', {
          driverId: decoded.driverId,
          vehicleId: decoded.vehicleId,
          endTime: tripEndTime,
          endLocation: { latitude: endLatitude, longitude: endLongitude },
          distance,
          duration,
          finalPrice,
          tariff: tariffUsed
        })
        
        await db.tripLog.update({
          where: { id: tripLog.id },
          data: { tripEndApiSent: true }
        })
      } catch (apiError) {
        console.error('Government API error:', apiError)
        await db.tripLog.update({
          where: { id: tripLog.id },
          data: { apiErrorLog: String(apiError) }
        })
      }
    }

    return NextResponse.json({
      id: tripLog.id,
      message: 'Trip logged successfully'
    })

  } catch (error) {
    console.error('Trip logging error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Token') ? 401 : 500 }
    )
  }
}

// GET - Retrieve trip logs
export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const tripLogs = await db.tripLog.findMany({
      where: {
        driverId: decoded.driverId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        vehicle: {
          select: {
            licensePlate: true,
            brand: true,
            model: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    })

    const total = await db.tripLog.count({
      where: {
        driverId: decoded.driverId
      }
    })

    return NextResponse.json({
      trips: tripLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Trip retrieval error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Token') ? 401 : 500 }
    )
  }
}

// Function to send data to government API
async function sendToGovernmentAPI(tripLogId: string, requestType: 'TRIP_START' | 'TRIP_END', payload: any) {
  const endpoint = `${process.env.GOVERNMENT_API_BASE_URL}/${requestType.toLowerCase()}`
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOVERNMENT_API_KEY}`,
      },
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()

    // Log the API request
    await db.governmentApiRequest.create({
      data: {
        tripLogId,
        requestType: requestType === 'TRIP_START' ? 'TRIP_START' : 'TRIP_END',
        endpoint,
        payload,
        response: responseData,
        statusCode: response.status,
        success: response.ok
      }
    })

    if (!response.ok) {
      throw new Error(`Government API error: ${response.status} ${response.statusText}`)
    }

    return responseData

  } catch (error) {
    // Log failed API request
    await db.governmentApiRequest.create({
      data: {
        tripLogId,
        requestType: requestType === 'TRIP_START' ? 'TRIP_START' : 'TRIP_END',
        endpoint,
        payload,
        statusCode: 0,
        success: false,
        errorMessage: String(error)
      }
    })
    
    throw error
  }
} 