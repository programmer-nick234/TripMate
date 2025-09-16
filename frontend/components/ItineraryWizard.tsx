'use client'

import { useState } from 'react'
import { MapPin, Calendar, DollarSign, Heart, ArrowRight, Sparkles } from 'lucide-react'

interface ItineraryWizardProps {
  onItineraryGenerated: (itinerary: any) => void
}

export default function ItineraryWizard({ onItineraryGenerated }: ItineraryWizardProps) {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    interests: [] as string[],
    constraints: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isValid, setIsValid] = useState(false)

  const interestOptions = [
    'Culture & History', 'Food & Dining', 'Nature & Outdoors', 
    'Art & Museums', 'Nightlife', 'Shopping', 'Adventure', 'Relaxation'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'destination':
        if (!value || value.trim().length < 2) {
          newErrors.destination = 'Please enter a valid destination'
        } else {
          delete newErrors.destination
        }
        break
      case 'startDate':
        if (!value) {
          newErrors.startDate = 'Please select a start date'
        } else if (formData.endDate && new Date(value) >= new Date(formData.endDate)) {
          newErrors.startDate = 'Start date must be before end date'
        } else {
          delete newErrors.startDate
        }
        break
      case 'endDate':
        if (!value) {
          newErrors.endDate = 'Please select an end date'
        } else if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
          newErrors.endDate = 'End date must be after start date'
        } else {
          delete newErrors.endDate
        }
        break
      case 'budget':
        if (!value || parseFloat(value) < 100) {
          newErrors.budget = 'Please enter a budget of at least $100'
        } else {
          delete newErrors.budget
        }
        break
    }
    
    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0 && !!formData.destination && !!formData.startDate && !!formData.endDate && !!formData.budget)
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          budget: parseFloat(formData.budget),
          interests: formData.interests,
          constraints: formData.constraints ? { notes: formData.constraints } : {}
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      onItineraryGenerated(data.generated_data)
    } catch (error) {
      console.error('Error generating itinerary:', error)
      alert('Failed to generate itinerary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Trip</h2>
          <p className="text-gray-600">Tell us about your dream destination and we'll create a personalized itinerary</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Where do you want to go?
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              placeholder="e.g., Paris, Tokyo, New York"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.destination ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Budget (USD)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              placeholder="e.g., 1500"
              min="100"
              step="50"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.budget ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="inline h-4 w-4 mr-1" />
              What interests you? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any special requirements or constraints?
            </label>
            <textarea
              value={formData.constraints}
              onChange={(e) => handleInputChange('constraints', e.target.value)}
              placeholder="e.g., vegetarian restaurants only, wheelchair accessible, avoid crowds"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating || !isValid}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating your itinerary...</span>
              </>
            ) : (
              <>
                <span>Generate My Itinerary</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
