'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Send, Bot, User, ArrowLeft, RotateCcw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import ChatPerformance from './ChatPerformance'

interface OptimizedChatProps {
  session: any
  itinerary: any
  onBackToResults: () => void
}

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  edit_applied?: boolean
  isTyping?: boolean
  error?: boolean
}

export default function OptimizedChat({ session, itinerary, onBackToResults }: OptimizedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Memoized message count for performance
  const messageCount = useMemo(() => messages.length, [messages.length])

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: session.welcome_message || "Hi! I'm TripMate, your personal travel assistant. I can help you edit your itinerary, answer questions, or suggest improvements. What would you like to do?",
      timestamp: new Date().toISOString()
    }
    setMessages([welcomeMessage])
  }, [session])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Optimized message sending with retry logic
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    // Generate unique ID for message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Add user message immediately
    const newUserMessage: Message = {
      id: messageId,
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    // Add typing indicator
    const typingMessage: Message = {
      id: `${messageId}_typing`,
      type: 'assistant',
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
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== `${messageId}_typing`))
      
      // Add assistant response
      const assistantMessage: Message = {
        id: `${messageId}_response`,
        type: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        edit_applied: data.edit_applied
      }
      setMessages(prev => [...prev, assistantMessage])

      setIsConnected(true)
      setRetryCount(0)

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== `${messageId}_typing`))
      
      const errorMessage: Message = {
        id: `${messageId}_error`,
        type: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        error: true
      }
      setMessages(prev => [...prev, errorMessage])

      const errorMsg = error instanceof Error ? error.message : 'Network error. Please check your connection.'
      setError(errorMsg)
      setIsConnected(false)
      setRetryCount(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }, [inputMessage, isLoading, session.session_id])

  // Retry function
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setError(null)
      setIsConnected(true)
      inputRef.current?.focus()
    }
  }, [retryCount])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Format time with better performance
  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }, [])

  // Quick action suggestions
  const quickActions = useMemo(() => [
    "Add a romantic dinner",
    "What's the total cost?",
    "Make it more budget-friendly",
    "Add more cultural activities",
    "Suggest local restaurants",
    "Optimize the schedule"
  ], [])

  const handleQuickAction = useCallback((action: string) => {
    setInputMessage(action)
    inputRef.current?.focus()
  }, [])

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg h-[700px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-6 w-6" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">TripMate Chat</h1>
              <p className="text-sm text-blue-100">
                {isConnected ? 'Connected' : 'Disconnected'} • {messageCount} messages
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onBackToResults}
              className="text-blue-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-blue-700"
              title="Back to Results"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-red-700 font-medium">Connection Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {retryCount < 3 && (
                <button
                  onClick={handleRetry}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              )}
              <button
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.error
                  ? 'bg-red-100 text-red-600'
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
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.isTyping ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{message.content}</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <div className={`flex items-center justify-between mt-2 text-xs ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.edit_applied && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Updated</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Send</span>
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{inputMessage.length}/500 characters</span>
          <span>Press Enter to send</span>
        </div>
      </div>

      {/* Performance Monitor */}
      <ChatPerformance 
        messageCount={messageCount}
        isLoading={isLoading}
        isConnected={isConnected}
        retryCount={retryCount}
      />
    </div>
  )
}
