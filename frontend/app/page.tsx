'use client'

import { useState } from 'react'
import { MapPin, Calendar, DollarSign, Heart, Sparkles } from 'lucide-react'
import ItineraryWizard from '@/components/ItineraryWizard'
import ItineraryResults from '@/components/ItineraryResults'
import OptimizedChat from '@/components/OptimizedChat'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'wizard' | 'results' | 'chat'>('wizard')
  const [itinerary, setItinerary] = useState(null)
  const [chatSession, setChatSession] = useState(null)

  const handleItineraryGenerated = (newItinerary: any) => {
    setItinerary(newItinerary)
    setCurrentStep('results')
  }

  const handleStartChat = (session: any) => {
    setChatSession(session)
    setCurrentStep('chat')
  }

  const handleBackToResults = () => {
    setCurrentStep('results')
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">TripMate</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {currentStep === 'wizard' && (
        <div className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">
                Plan Your Perfect Trip with AI
              </h2>
              <p className="text-xl mb-8 text-primary-100">
                Create, edit, and refine your travel itinerary through natural conversation
              </p>
              <div className="flex justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Smart Recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Flexible Scheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Budget Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Personalized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'wizard' && (
          <ItineraryWizard onItineraryGenerated={handleItineraryGenerated} />
        )}
        
        {currentStep === 'results' && itinerary && (
          <ItineraryResults 
            itinerary={itinerary} 
            onStartChat={handleStartChat}
            onBackToWizard={() => setCurrentStep('wizard')}
          />
        )}
        
        {currentStep === 'chat' && chatSession && itinerary && (
          <OptimizedChat 
            session={chatSession}
            itinerary={itinerary}
            onBackToResults={handleBackToResults}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 TripMate. Your AI travel companion.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
