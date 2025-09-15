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

  useEffect(() => {
    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      if (typeof window !== 'undefined' && !window.mapboxgl) {
        const mapboxgl = await import('mapbox-gl')
        window.mapboxgl = mapboxgl.default
        window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'
        setIsLoaded(true)
      } else {
        setIsLoaded(true)
      }
    }

    loadMapbox()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || !itinerary) return

    // Initialize map
    if (window.mapboxgl) {
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [2.3522, 48.8566], // Default to Paris
        zoom: 10
      })

      // Add navigation control
      map.current.addControl(new window.mapboxgl.NavigationControl())

      // Add markers for each activity
      itinerary.days.forEach((day: any, dayIndex: number) => {
        day.schedule.forEach((activity: any, activityIndex: number) => {
          if (activity.location.lat !== 0 && activity.location.lng !== 0) {
            const el = document.createElement('div')
            el.className = 'marker'
            el.innerHTML = `<div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">${dayIndex + 1}</div>`
            
            new window.mapboxgl.Marker(el)
              .setLngLat([activity.location.lng, activity.location.lat])
              .setPopup(
                new window.mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div class="p-2">
                      <h3 class="font-semibold text-gray-900">${activity.activity}</h3>
                      <p class="text-sm text-gray-600">Day ${day.day} at ${activity.time}</p>
                      <p class="text-sm text-gray-500">${activity.type}</p>
                    </div>
                  `)
              )
              .addTo(map.current)
          }
        })
      })

      // Fit map to show all markers
      if (itinerary.map_points && itinerary.map_points.length > 0) {
        const bounds = new window.mapboxgl.LngLatBounds()
        itinerary.map_points.forEach((point: any) => {
          bounds.extend([point.lng, point.lat])
        })
        map.current.fitBounds(bounds, { padding: 50 })
      }
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [isLoaded, itinerary])

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
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    mapboxgl: any
  }
}
