'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, MessageSquare, Zap } from 'lucide-react'

interface ChatPerformanceProps {
  messageCount: number
  isLoading: boolean
  isConnected: boolean
  retryCount: number
}

export default function ChatPerformance({ messageCount, isLoading, isConnected, retryCount }: ChatPerformanceProps) {
  const [startTime] = useState(Date.now())
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && lastResponseTime) {
      const responseTime = Date.now() - lastResponseTime
      setResponseTimes(prev => [...prev.slice(-9), responseTime]) // Keep last 10 response times
    }
  }, [isLoading, lastResponseTime])

  useEffect(() => {
    if (isLoading) {
      setLastResponseTime(Date.now())
    }
  }, [isLoading])

  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  const uptime = Math.round((Date.now() - startTime) / 1000)

  return (
    <div className="bg-gray-50 border-t border-gray-200 p-3">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{messageCount} messages</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Activity className={`h-3 w-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {avgResponseTime > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{avgResponseTime}ms avg</span>
            </div>
          )}

          {retryCount > 0 && (
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-yellow-600">{retryCount} retries</span>
            </div>
          )}
        </div>

        <div className="text-gray-500">
          Uptime: {Math.floor(uptime / 60)}m {uptime % 60}s
        </div>
      </div>
    </div>
  )
}
