// Shared TypeScript types for TripMate

export interface Itinerary {
  id?: number
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  interests: string[]
  constraints: Record<string, any>
  itinerary_data: ItineraryData
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

export interface ItineraryData {
  trip_summary: string
  days: Day[]
  total_estimated_cost: number
  map_points: MapPoint[]
  adjustment_reasons: string[]
  booking_links: string[]
  warnings: string[]
}

export interface Day {
  day: number
  date: string
  schedule: Activity[]
}

export interface Activity {
  time: string
  activity: string
  type: 'cultural' | 'dining' | 'sightseeing' | 'entertainment' | 'shopping' | 'outdoor'
  duration: string
  cost_estimate: number
  location: {
    lat: number
    lng: number
  }
  notes: string
}

export interface MapPoint {
  name: string
  lat: number
  lng: number
}

export interface ChatSession {
  session_id: string
  itinerary_id?: number
  created_at: string
  is_active: boolean
}

export interface ChatMessage {
  id: number
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ItineraryEditRequest {
  edit_type: 'add' | 'remove' | 'modify' | 'move' | 'reschedule'
  day?: number
  activity_index?: number
  new_activity?: Activity
  edit_reason?: string
}

export interface TripMateResponse {
  response: string
  edit_applied: boolean
  updated_itinerary?: ItineraryData
}
