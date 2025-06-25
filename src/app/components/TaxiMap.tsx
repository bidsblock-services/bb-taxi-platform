'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

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
  estimatedArrival: number
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

interface TaxiMapProps {
  center: { lat: number; lng: number }
  taxis: Taxi[]
  selectedTaxi: Taxi | null
  onTaxiSelect: (taxi: Taxi) => void
}

export default function TaxiMap({ center, taxis, selectedTaxi, onTaxiSelect }: TaxiMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current) return

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current)
    }

    // Custom icon for user location
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: #3B82F6; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    userMarkerRef.current = L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup('Your Location')

    mapRef.current.setView([center.lat, center.lng], 13)
  }, [center])

  // Update taxi markers
  useEffect(() => {
    if (!mapRef.current) return

    // Remove old markers
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker)
      }
    })
    markersRef.current.clear()

    // Add new markers for each taxi
    taxis.forEach(taxi => {
      const isSelected = selectedTaxi?.id === taxi.id
      const isAvailable = taxi.status === 'available'

      // Create custom taxi icon
      const taxiIcon = L.divIcon({
        className: 'taxi-marker',
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: ${isAvailable ? (isSelected ? '#059669' : '#10B981') : '#6B7280'}; 
            border: 3px solid ${isSelected ? '#ffffff' : 'transparent'}; 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M5 11L6.5 6.5H17.5L19 11M17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16M6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16M17 8H7L5.5 12V17H6.5C6.5 18.1 7.4 19 8.5 19S10.5 18.1 10.5 17H13.5C13.5 18.1 14.4 19 15.5 19S17.5 18.1 17.5 17H18.5V12L17 8Z"/>
            </svg>
            ${isSelected ? '<div style="position: absolute; top: -8px; right: -8px; width: 16px; height: 16px; background: #EF4444; border: 2px solid white; border-radius: 50%;"></div>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      const marker = L.marker([taxi.currentLocation.lat, taxi.currentLocation.lng], { 
        icon: taxiIcon 
      })

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${taxi.driverName}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
            ${taxi.vehicleBrand} ${taxi.vehicleModel} • ${taxi.licensePlate}
          </p>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="font-size: 12px; color: #666;">★ ${taxi.rating} (${taxi.totalTrips} trips)</span>
          </div>
          <div style="background: #F3F4F6; padding: 8px; border-radius: 4px; margin: 8px 0;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">
              Tariff ${taxi.currentTariff.code}: ${taxi.currentTariff.name}
            </div>
            <div style="font-size: 11px; color: #666;">
              Start: €${taxi.currentTariff.startPrice.toFixed(2)} | 
              Per km: €${taxi.currentTariff.pricePerKm.toFixed(2)}
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
            <span style="
              padding: 2px 6px; 
              border-radius: 12px; 
              font-size: 11px; 
              background: ${isAvailable ? '#DCFCE7' : '#F3F4F6'};
              color: ${isAvailable ? '#166534' : '#6B7280'};
            ">
              ${taxi.status === 'available' ? `${taxi.estimatedArrival} min away` : 'Busy'}
            </span>
            ${isAvailable ? `
              <button onclick="selectTaxi('${taxi.id}')" style="
                background: #3B82F6; 
                color: white; 
                border: none; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 11px;
                cursor: pointer;
              ">
                Select
              </button>
            ` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      // Add click handler
      marker.on('click', () => {
        onTaxiSelect(taxi)
      })

      if (mapRef.current) {
        marker.addTo(mapRef.current)
        markersRef.current.set(taxi.id, marker)
      }
    })

    // Make selectTaxi function available globally for popup buttons
    ;(window as any).selectTaxi = (taxiId: string) => {
      const taxi = taxis.find(t => t.id === taxiId)
      if (taxi) {
        onTaxiSelect(taxi)
      }
    }

  }, [taxis, selectedTaxi, onTaxiSelect])

  // Highlight selected taxi
  useEffect(() => {
    if (!mapRef.current || !selectedTaxi) return

    const selectedMarker = markersRef.current.get(selectedTaxi.id)
    if (selectedMarker) {
      // Pan to selected taxi
      mapRef.current.panTo([selectedTaxi.currentLocation.lat, selectedTaxi.currentLocation.lng])
      
      // Open popup
      selectedMarker.openPopup()
    }
  }, [selectedTaxi])

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 z-[1000]">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Map Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 border border-white rounded-full mr-2"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded mr-2 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M5 11L6.5 6.5H17.5L19 11M17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16M6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16M17 8H7L5.5 12V17H6.5C6.5 18.1 7.4 19 8.5 19S10.5 18.1 10.5 17H13.5C13.5 18.1 14.4 19 15.5 19S17.5 18.1 17.5 17H18.5V12L17 8Z"/>
              </svg>
            </div>
            <span>Available Taxi</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-500 rounded mr-2 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M5 11L6.5 6.5H17.5L19 11M17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16M6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16M17 8H7L5.5 12V17H6.5C6.5 18.1 7.4 19 8.5 19S10.5 18.1 10.5 17H13.5C13.5 18.1 14.4 19 15.5 19S17.5 18.1 17.5 17H18.5V12L17 8Z"/>
              </svg>
            </div>
            <span>Busy Taxi</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 space-y-2 z-[1000]">
        <button
          onClick={() => {
            if (mapRef.current && userMarkerRef.current) {
              mapRef.current.panTo([center.lat, center.lng])
            }
          }}
          className="bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          title="Center on your location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"/>
          </svg>
        </button>
      </div>
    </div>
  )
} 