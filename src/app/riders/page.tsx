'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, MapPin, Clock, Star, Phone, Navigation, Filter, Search } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues
const Map = dynamic(() => import('../components/TaxiMap'), { ssr: false })

interface Taxi {
  id: string
  driverId: string
  driverName: string
  vehicleId: string
  licensePlate: string
  vehicleBrand: string
  vehicleModel: string
  currentLocation: {
    lat: number
    lng: number
    address: string
  }
  status: 'available' | 'busy' | 'offline'
  rating: number
  totalTrips: number
  estimatedArrival: number // minutes
  currentTariff: {
    id: string
    name: string
    code: string
    type: 'meter_based' | 'fixed_based'
    startPrice: number
    pricePerKm: number
    pricePerMinute: number
    nightSurcharge: number
  }
}

interface BookingRequest {
  pickupLocation: {
    lat: number
    lng: number
    address: string
  }
  destination?: {
    lat: number
    lng: number
    address: string
  }
  selectedTaxiId: string
  tariffType: string
  estimatedPrice: number
  riderInfo: {
    name: string
    phone: string
    notes?: string
  }
}

export default function RidersPage() {
  const [taxis, setTaxis] = useState<Taxi[]>([])
  const [selectedTaxi, setSelectedTaxi] = useState<Taxi | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [pickupAddress, setPickupAddress] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'nearby'>('available')
  const [searchQuery, setSearchQuery] = useState('')

  const [bookingForm, setBookingForm] = useState({
    riderName: '',
    riderPhone: '',
    notes: '',
    scheduledTime: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to Brussels center
          setUserLocation({ lat: 50.8503, lng: 4.3517 })
        }
      )
    } else {
      // Default to Brussels center
      setUserLocation({ lat: 50.8503, lng: 4.3517 })
    }

    // Mock taxi data
    const mockTaxis: Taxi[] = [
      {
        id: '1',
        driverId: 'driver1',
        driverName: 'Jean Dupont',
        vehicleId: 'vehicle1',
        licensePlate: '1-ABC-123',
        vehicleBrand: 'Mercedes',
        vehicleModel: 'E-Class',
        currentLocation: {
          lat: 50.8505,
          lng: 4.3520,
          address: 'Grand Place, Brussels'
        },
        status: 'available',
        rating: 4.8,
        totalTrips: 1250,
        estimatedArrival: 3,
        currentTariff: {
          id: 'tariff1',
          name: 'Standard',
          code: 'A',
          type: 'meter_based',
          startPrice: 4.20,
          pricePerKm: 1.80,
          pricePerMinute: 0.50,
          nightSurcharge: 2.00
        }
      },
      {
        id: '2',
        driverId: 'driver2',
        driverName: 'Marie Lambert',
        vehicleId: 'vehicle2',
        licensePlate: '1-DEF-456',
        vehicleBrand: 'Volkswagen',
        vehicleModel: 'Passat',
        currentLocation: {
          lat: 50.8456,
          lng: 4.3572,
          address: 'European Quarter, Brussels'
        },
        status: 'available',
        rating: 4.6,
        totalTrips: 890,
        estimatedArrival: 7,
        currentTariff: {
          id: 'tariff2',
          name: 'Comfort',
          code: 'B',
          type: 'meter_based',
          startPrice: 5.50,
          pricePerKm: 2.20,
          pricePerMinute: 0.60,
          nightSurcharge: 2.50
        }
      },
      {
        id: '3',
        driverId: 'driver3',
        driverName: 'Ahmed Hassan',
        vehicleId: 'vehicle3',
        licensePlate: '1-GHI-789',
        vehicleBrand: 'BMW',
        vehicleModel: '3 Series',
        currentLocation: {
          lat: 50.8476,
          lng: 4.3619,
          address: 'Schuman Roundabout, Brussels'
        },
        status: 'busy',
        rating: 4.9,
        totalTrips: 2100,
        estimatedArrival: 0,
        currentTariff: {
          id: 'tariff3',
          name: 'Premium',
          code: 'C',
          type: 'meter_based',
          startPrice: 7.00,
          pricePerKm: 2.80,
          pricePerMinute: 0.80,
          nightSurcharge: 3.00
        }
      }
    ]
    setTaxis(mockTaxis)
  }, [])

  const filteredTaxis = taxis.filter(taxi => {
    // Filter by status
    if (filterStatus === 'available' && taxi.status !== 'available') return false
    if (filterStatus === 'nearby' && taxi.estimatedArrival > 10) return false
    
    // Filter by search query
    if (searchQuery && !taxi.driverName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !taxi.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  const calculateEstimatedPrice = (taxi: Taxi, distance: number = 5) => {
    const { startPrice, pricePerKm } = taxi.currentTariff
    return startPrice + (distance * pricePerKm)
  }

  const handleBookTaxi = (taxi: Taxi) => {
    setSelectedTaxi(taxi)
    setShowBookingForm(true)
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTaxi) return

    const booking: BookingRequest = {
      pickupLocation: userLocation ? {
        lat: userLocation.lat,
        lng: userLocation.lng,
        address: pickupAddress || 'Current Location'
      } : selectedTaxi.currentLocation,
      destination: destinationAddress ? {
        lat: 0, lng: 0, address: destinationAddress
      } : undefined,
      selectedTaxiId: selectedTaxi.id,
      tariffType: selectedTaxi.currentTariff.code,
      estimatedPrice: calculateEstimatedPrice(selectedTaxi),
      riderInfo: {
        name: bookingForm.riderName,
        phone: bookingForm.riderPhone,
        notes: bookingForm.notes
      }
    }

    console.log('Booking submitted:', booking)
    alert('Booking request sent! The driver will contact you shortly.')
    setShowBookingForm(false)
    setSelectedTaxi(null)
    setBookingForm({ riderName: '', riderPhone: '', notes: '', scheduledTime: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">TaxiPlatform</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/drivers" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Drivers
              </Link>
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Find a Ride</h1>
          <p className="text-gray-600 mt-2">Book a taxi near you with real-time tracking and transparent pricing</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Search and Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Inputs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Trip</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter pickup address or use current location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Destination (Optional)
                  </label>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder="Enter destination address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Availability
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Taxis</option>
                    <option value="available">Available Only</option>
                    <option value="nearby">Nearby (≤10 min)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="h-4 w-4 inline mr-1" />
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by driver name or plate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Available Taxis List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Taxis ({filteredTaxis.length})
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTaxis.map((taxi) => (
                    <div
                      key={taxi.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedTaxi?.id === taxi.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTaxi(taxi)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{taxi.driverName}</h3>
                          <p className="text-sm text-gray-600">
                            {taxi.vehicleBrand} {taxi.vehicleModel} • {taxi.licensePlate}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {taxi.rating} ({taxi.totalTrips})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {taxi.status === 'available' 
                            ? `${taxi.estimatedArrival} min away`
                            : 'Currently busy'
                          }
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          taxi.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {taxi.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Tariff {taxi.currentTariff.code}: {taxi.currentTariff.name}
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Start: €{taxi.currentTariff.startPrice.toFixed(2)}</p>
                          <p>Per km: €{taxi.currentTariff.pricePerKm.toFixed(2)} | Per min: €{taxi.currentTariff.pricePerMinute.toFixed(2)}</p>
                          <p className="font-medium">Est. price (5km): €{calculateEstimatedPrice(taxi, 5).toFixed(2)}</p>
                        </div>
                      </div>

                      {taxi.status === 'available' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookTaxi(taxi)
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Book This Taxi
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full min-h-[600px]">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Live Taxi Map</h2>
                <p className="text-sm text-gray-600">See all available taxis in real-time</p>
              </div>
              <div className="h-full p-4">
                {userLocation && (
                  <Map 
                    center={userLocation}
                    taxis={filteredTaxis}
                    selectedTaxi={selectedTaxi}
                    onTaxiSelect={setSelectedTaxi}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedTaxi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Book Your Ride</h2>
              
              {/* Selected Taxi Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900">{selectedTaxi.driverName}</h3>
                <p className="text-sm text-gray-600">
                  {selectedTaxi.vehicleBrand} {selectedTaxi.vehicleModel} • {selectedTaxi.licensePlate}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{selectedTaxi.rating} rating</span>
                  <span className="text-sm text-gray-600 ml-2">• {selectedTaxi.estimatedArrival} min away</span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.riderName}
                    onChange={(e) => setBookingForm({...bookingForm, riderName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.riderPhone}
                    onChange={(e) => setBookingForm({...bookingForm, riderPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    placeholder="Any special instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Trip Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Pickup: {pickupAddress || 'Current Location'}</p>
                    {destinationAddress && <p>Destination: {destinationAddress}</p>}
                    <p>Tariff: {selectedTaxi.currentTariff.name} ({selectedTaxi.currentTariff.code})</p>
                    <p className="font-medium">Estimated Price: €{calculateEstimatedPrice(selectedTaxi, 5).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 