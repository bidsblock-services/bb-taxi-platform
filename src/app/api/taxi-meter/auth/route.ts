import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, deviceId } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user with driver profile
    const user = await db.user.findUnique({
      where: { email },
      include: {
        driverProfile: {
          include: {
            company: true,
            vehicle: true
          }
        }
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is a driver
    if (!user.driverProfile) {
      return NextResponse.json(
        { error: 'Access denied. Driver profile required.' },
        { status: 403 }
      )
    }

    // Check if driver is active
    if (user.driverProfile.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Driver account is not active' },
        { status: 403 }
      )
    }

    // Check if company is active
    if (user.driverProfile.company.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Company account is not active' },
        { status: 403 }
      )
    }

    // Generate JWT token for taxi meter app
    const token = jwt.sign(
      {
        userId: user.id,
        driverId: user.driverProfile.id,
        companyId: user.driverProfile.companyId,
        vehicleId: user.driverProfile.vehicleId,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    )

    // Update driver status to online
    await db.driver.update({
      where: { id: user.driverProfile.id },
      data: {
        isOnline: true,
        lastLocationUpdate: new Date()
      }
    })

    // Log driver login
    await db.tripLog.create({
      data: {
        logType: 'DRIVER_LOGIN',
        companyId: user.driverProfile.companyId,
        vehicleId: user.driverProfile.vehicleId,
        driverId: user.driverProfile.id,
        userId: user.id,
        logDetails: {
          deviceId,
          loginTime: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      }
    })

    return NextResponse.json({
      token,
      driver: {
        id: user.driverProfile.id,
        name: `${user.driverProfile.firstName} ${user.driverProfile.lastName}`,
        email: user.email,
        phone: user.driverProfile.phone,
        taxiDriverLicense: user.driverProfile.taxiDriverLicense,
        vehicle: user.driverProfile.vehicle ? {
          id: user.driverProfile.vehicle.id,
          licensePlate: user.driverProfile.vehicle.licensePlate,
          brand: user.driverProfile.vehicle.brand,
          model: user.driverProfile.vehicle.model
        } : null,
        company: {
          id: user.driverProfile.company.id,
          name: user.driverProfile.company.name,
          taxiLicenseNumber: user.driverProfile.company.taxiLicenseNumber
        }
      },
      message: 'Authentication successful'
    })

  } catch (error) {
    console.error('Taxi meter auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any

    // Update driver status to offline
    await db.driver.update({
      where: { id: decoded.driverId },
      data: {
        isOnline: false,
        lastLocationUpdate: new Date()
      }
    })

    // Log driver logout
    await db.tripLog.create({
      data: {
        logType: 'DRIVER_LOGOUT',
        companyId: decoded.companyId,
        vehicleId: decoded.vehicleId,
        driverId: decoded.driverId,
        userId: decoded.userId,
        logDetails: {
          logoutTime: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      }
    })

    return NextResponse.json({ message: 'Logout successful' })

  } catch (error) {
    console.error('Taxi meter logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 