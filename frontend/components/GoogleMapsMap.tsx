'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Clock, DollarSign } from 'lucide-react'

interface MapPoint {
  lat: number
  lng: number
  name: string
  description?: string
  time?: string
  cost?: string
}

interface Itinerary {
  id?: string
  trip_summary?: string
  days?: Array<{
    day: number
    schedule?: Array<{
      time: string
      activity: string
      location: string
      cost?: string
      coordinates?: { lat: number; lng: number }
    }>
  }>
  map_points?: MapPoint[]
}

interface GoogleMapsMapProps {
  itinerary: Itinerary | null
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GoogleMapsMap({ itinerary, className = '' }: GoogleMapsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // Load Google Maps API
  const loadGoogleMaps = async () => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    try {
      const { Loader } = await import('@googlemaps/js-api-loader')
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        throw new Error('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.')
      }

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      })

      await loader.load()
      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading Google Maps:', error)
      setMapError('Failed to load Google Maps. Please check your API key.')
    }
  }

  // Initialize map
  useEffect(() => {
    loadGoogleMaps()
  }, [])

  // Create map and markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapError) return

    try {
      // Default center (Paris) or first itinerary point
      const center = itinerary?.map_points?.[0] 
        ? { lat: itinerary.map_points[0].lat, lng: itinerary.map_points[0].lng }
        : { lat: 48.8566, lng: 2.3522 }

      // Create map
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: (itinerary?.map_points?.length ?? 0) > 0 ? 12 : 10,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      setMap(newMap)

      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      const newMarkers: any[] = []

      // Add markers for itinerary points
      if (itinerary?.map_points && itinerary.map_points.length > 0) {
        itinerary.map_points.forEach((point, index) => {
          const marker = new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: newMap,
            title: point.name,
            label: {
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold'
            },
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${index + 1}</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }
          })

          // Create info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-gray-900 mb-2">${point.name}</h3>
                ${point.description ? `<p class="text-sm text-gray-600 mb-2">${point.description}</p>` : ''}
                ${point.time ? `<div class="flex items-center text-sm text-gray-500 mb-1">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  ${point.time}
                </div>` : ''}
                ${point.cost ? `<div class="flex items-center text-sm text-green-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  ${point.cost}
                </div>` : ''}
              </div>
            `
          })

          // Add click listener
          marker.addListener('click', () => {
            infoWindow.open(newMap, marker)
          })

          newMarkers.push(marker)
        })

        // Fit map to show all markers
        if (newMarkers.length > 1) {
          const bounds = new window.google.maps.LatLngBounds()
          newMarkers.forEach(marker => {
            const position = marker.getPosition()
            if (position) bounds.extend(position)
          })
          newMap.fitBounds(bounds)
        }
      }

      setMarkers(newMarkers)

    } catch (error) {
      console.error('Error initializing Google Maps:', error)
      setMapError('Failed to initialize map. Please try again.')
    }
  }, [isLoaded, itinerary, mapError])

  // Fallback when Google Maps is not available
  if (!window.google && !isLoaded) {
    return (
      <div className={`h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-blue-500 mb-4">
            <MapPin className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Itinerary Map</h3>
          <p className="text-gray-600 mb-4">Loading Google Maps...</p>
          <div className="bg-white p-4 rounded-lg shadow-sm max-w-md">
            <p className="text-sm text-gray-500 mb-2">Your itinerary locations:</p>
            <div className="space-y-1">
              {itinerary?.days?.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="text-sm text-gray-700">
                  <strong>Day {day.day}:</strong> {day.schedule?.length || 0} activities
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (mapError) {
    return (
      <div className={`h-96 bg-gradient-to-br from-red-50 to-pink-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapPin className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          <div className="bg-white p-4 rounded-lg shadow-sm max-w-md">
            <p className="text-sm text-gray-500 mb-2">Your itinerary locations:</p>
            <div className="space-y-1">
              {itinerary?.days?.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="text-sm text-gray-700">
                  <strong>Day {day.day}:</strong> {day.schedule?.length || 0} activities
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg shadow-lg"
        style={{ minHeight: '384px' }}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => {
            if (map && (itinerary?.map_points?.length ?? 0) > 0) {
              const bounds = new window.google.maps.LatLngBounds()
              markers.forEach(marker => {
                const position = marker.getPosition()
                if (position) bounds.extend(position)
              })
              map.fitBounds(bounds)
            }
          }}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <Navigation className="h-4 w-4" />
          <span>Fit All</span>
        </button>
      </div>

      {/* Itinerary Summary */}
      {itinerary?.map_points && (itinerary.map_points.length ?? 0) > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-500" />
            Itinerary Locations ({itinerary.map_points.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {itinerary.map_points.map((point, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">{point.name}</h5>
                  {point.description && (
                    <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {point.time && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {point.time}
                      </div>
                    )}
                    {point.cost && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {point.cost}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
