'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'

interface ItineraryMapProps {
  itinerary: any
}

export default function ItineraryMap({ itinerary }: ItineraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      try {
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          const mapboxgl = await import('mapbox-gl')
          window.mapboxgl = mapboxgl.default
          
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          if (!token || token === 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example') {
            setMapError('Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.')
            return
          }
          
          window.mapboxgl.accessToken = token
          setIsLoaded(true)
        } else {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading Mapbox:', error)
        setMapError('Failed to load map. Please check your internet connection.')
      }
    }

    loadMapbox()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || !itinerary || mapError) return

    try {
      // Initialize map
      if (window.mapboxgl) {
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [2.3522, 48.8566], // Default to Paris
          zoom: 10
        })

        // Add navigation control
        map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right')
        
        // Add geolocate control
        map.current.addControl(new window.mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }), 'top-right')

        // Add fullscreen control
        map.current.addControl(new window.mapboxgl.FullscreenControl(), 'top-right')

        // Wait for map to load
        map.current.on('load', () => {
          // Add markers for each activity
          const markers: any[] = []
          
          itinerary.days.forEach((day: any, dayIndex: number) => {
            day.schedule.forEach((activity: any, activityIndex: number) => {
              if (activity.location && activity.location.lat !== 0 && activity.location.lng !== 0) {
                const el = document.createElement('div')
                el.className = 'marker'
                el.innerHTML = `<div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">${dayIndex + 1}</div>`
                
                const marker = new window.mapboxgl.Marker(el)
                  .setLngLat([activity.location.lng, activity.location.lat])
                  .setPopup(
                    new window.mapboxgl.Popup({ 
                      offset: 25,
                      closeButton: true,
                      closeOnClick: false
                    })
                      .setHTML(`
                        <div class="p-3 min-w-[200px]">
                          <h3 class="font-semibold text-gray-900 mb-1">${activity.activity}</h3>
                          <p class="text-sm text-gray-600 mb-2">Day ${day.day} at ${activity.time}</p>
                          <p class="text-sm text-gray-500 mb-2">${activity.type || 'Activity'}</p>
                          ${activity.cost_estimate ? `<p class="text-sm text-green-600 font-medium">$${activity.cost_estimate}</p>` : ''}
                        </div>
                      `)
                  )
                  .addTo(map.current)
                
                markers.push(marker)

                // Add click handler
                el.addEventListener('click', () => {
                  setSelectedActivity(activity)
                })
              }
            })
          })

          // Fit map to show all markers
          if (markers.length > 0) {
            const bounds = new window.mapboxgl.LngLatBounds()
            markers.forEach(marker => {
              bounds.extend(marker.getLngLat())
            })
            map.current.fitBounds(bounds, { padding: 50 })
          } else if (itinerary.map_points && itinerary.map_points.length > 0) {
            const bounds = new window.mapboxgl.LngLatBounds()
            itinerary.map_points.forEach((point: any) => {
              bounds.extend([point.lng, point.lat])
            })
            map.current.fitBounds(bounds, { padding: 50 })
          }
        })

        // Handle map errors
        map.current.on('error', (e: any) => {
          console.error('Map error:', e)
          setMapError('Map failed to load. Please try refreshing the page.')
        })
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Failed to initialize map. Please try again.')
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [isLoaded, itinerary, mapError])

  if (mapError) {
    return (
      <div className="h-96 bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapPin className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Map Error</h3>
          <p className="text-red-700 mb-4">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Itinerary Map</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{itinerary.map_points?.length || 0} locations</span>
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        className="h-96 w-full rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />
      
      <div className="text-sm text-gray-500">
        <p>Click on the numbered markers to see activity details. The map shows all planned locations for your trip.</p>
        <p className="mt-1">Use the controls in the top-right corner to navigate, locate yourself, or view in fullscreen.</p>
      </div>

      {selectedActivity && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Activity</h4>
          <p className="text-blue-800">{selectedActivity.activity}</p>
          <p className="text-sm text-blue-600">{selectedActivity.time}</p>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    mapboxgl: any
  }
}
