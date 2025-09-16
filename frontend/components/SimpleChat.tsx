'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface SimpleChatProps {
  session: any
  itinerary: any
  onBackToResults: () => void
}

interface Message {
  id: number
  type: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function SimpleChat({ session, itinerary, onBackToResults }: SimpleChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 1,
      type: 'assistant',
      content: session.welcome_message || "Hi! I'm TripMate, your personal travel assistant. How can I help you?",
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
    setError(null)

    console.log('Sending message:', userMessage)

    // Add user message immediately
    const newUserMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])
    console.log('User message added:', newUserMessage)

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

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
      console.log('Assistant message added:', assistantMessage)

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.'
      setError(errorMsg)
      
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
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <h1 className="text-xl font-semibold">TripMate Chat</h1>
          </div>
          <button
            onClick={onBackToResults}
            className="text-primary-100 hover:text-white text-sm"
          >
            ← Back to Results
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={`px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center justify-between mt-2 text-xs ${
                  message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900">
                <p className="text-sm">TripMate is thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Debug Info */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">
        <p>Messages: {messages.length} | Loading: {isLoading.toString()} | Session: {session?.session_id?.substring(0, 8)}...</p>
      </div>
    </div>
  )
}
