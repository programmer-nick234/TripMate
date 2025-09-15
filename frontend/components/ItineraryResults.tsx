'use client'

import { useState } from 'react'
import { MapPin, Clock, DollarSign, MessageCircle, ArrowLeft, Map, Calendar, Star } from 'lucide-react'
import ItineraryMap from './ItineraryMap'

interface ItineraryResultsProps {
  itinerary: any
  onStartChat: (session: any) => void
  onBackToWizard: () => void
  onItineraryUpdate?: (updatedItinerary: any) => void
}

export default function ItineraryResults({ itinerary, onStartChat, onBackToWizard, onItineraryUpdate }: ItineraryResultsProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'map'>('schedule')
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [currentItinerary, setCurrentItinerary] = useState(itinerary)
  const [hasUpdates, setHasUpdates] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle itinerary updates from chat
  const handleItineraryUpdate = (updatedItinerary: any) => {
    setCurrentItinerary(updatedItinerary)
    setHasUpdates(true)
    if (onItineraryUpdate) {
      onItineraryUpdate(updatedItinerary)
    }
  }

  // Reset updates indicator
  const resetUpdates = () => {
    setHasUpdates(false)
  }

  const handleStartChat = async () => {
    setIsStartingChat(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/start/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itinerary_id: itinerary.id || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start chat session')
      }

      const data = await response.json()
      onStartChat(data)
    } catch (error) {
      console.error('Error starting chat:', error)
      setError(error instanceof Error ? error.message : 'Failed to start chat. Please try again.')
    } finally {
      setIsStartingChat(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getActivityTypeColor = (type: string) => {
    const colors = {
      cultural: 'bg-purple-100 text-purple-800',
      dining: 'bg-green-100 text-green-800',
      sightseeing: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-pink-100 text-pink-800',
      shopping: 'bg-yellow-100 text-yellow-800',
      outdoor: 'bg-emerald-100 text-emerald-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToWizard}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Planning</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isStartingChat ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting Chat...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with TripMate</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{currentItinerary.trip_summary}</h1>
            {hasUpdates && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Updated</span>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>${currentItinerary.total_estimated_cost}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{currentItinerary.days.length} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{currentItinerary.days[0]?.date} - {currentItinerary.days[currentItinerary.days.length - 1]?.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map className="inline h-4 w-4 mr-2" />
              Map View
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {currentItinerary.days.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Day {day.day} - {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {day.schedule.length} activities
                    </div>
                  </div>

                  <div className="space-y-4">
                    {day.schedule.map((activity: any, activityIndex: number) => (
                      <div key={activityIndex} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium text-gray-900">
                              {activity.activity}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeColor(activity.type)}`}>
                                {activity.type}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatTime(activity.time)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{activity.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${activity.cost_estimate}</span>
                            </div>
                            {activity.location.lat !== 0 && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>Location available</span>
                              </div>
                            )}
                          </div>
                          {activity.notes && (
                            <p className="mt-2 text-sm text-gray-600">
                              {activity.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'map' && (
            <ItineraryMap itinerary={currentItinerary} />
          )}
        </div>
      </div>

      {/* Warnings */}
      {currentItinerary.warnings && currentItinerary.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <Star className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {currentItinerary.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
