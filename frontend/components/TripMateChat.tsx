'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, ArrowLeft, Bot, User, Sparkles } from 'lucide-react'

interface TripMateChatProps {
  session: any
  itinerary: any
  onBackToResults: () => void
}

interface Message {
  id: number
  type: 'user' | 'assistant' | 'typing'
  content: string
  timestamp: string
  edit_applied?: boolean
  isTyping?: boolean
}

export default function TripMateChat({ session, itinerary, onBackToResults }: TripMateChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [updatedItinerary, setUpdatedItinerary] = useState(itinerary)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 1,
      type: 'assistant',
      content: session.welcome_message || "Hi! I'm TripMate, your personal travel assistant. I can help you edit your itinerary, answer questions, or suggest improvements. What would you like to do?",
      timestamp: new Date().toISOString()
    }])
  }, [session])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Add user message
    const newUserMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    // Add typing indicator
    const typingMessage: Message = {
      id: Date.now() + 0.5,
      type: 'typing',
      content: 'TripMate is thinking...',
      timestamp: new Date().toISOString(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.session_id,
          message: userMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.type !== 'typing'))
      
      // Add assistant response with animation
      const assistantMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        edit_applied: data.edit_applied
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update itinerary if changes were made
      if (data.edit_applied && data.updated_itinerary) {
        setUpdatedItinerary(data.updated_itinerary)
        // Notify parent component of itinerary update
        if (onBackToResults) {
          // You can add a callback here to update the parent component
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.type !== 'typing'))
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToResults}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Itinerary</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">TripMate Chat</h1>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
            >
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : message.type === 'typing'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : message.type === 'typing' ? (
                    <div className="animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.type === 'typing'
                    ? 'bg-blue-50 text-blue-900 border border-blue-200'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.type === 'typing' ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{message.content}</span>
                      <div className="loading-dots"></div>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.edit_applied && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ✓ Updated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator is now handled in the messages array */}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me to add activities, change times, adjust your budget..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "Add more food stops",
            "Make it more budget-friendly",
            "Add outdoor activities",
            "Reschedule for better weather",
            "Add cultural sites",
            "Make it more relaxed",
            "Add shopping time",
            "Include nightlife"
          ].map((action) => (
            <button
              key={action}
              onClick={() => setInputMessage(action)}
              className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
