import { useEffect, useRef, useState } from 'react'

export interface Alert {
  id: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL'
  lastRaisedTime: string
  escalationCount: number
  customParams: Record<string, unknown>
  status: 'open' | 'resolved'
}

export const useWebSocket = (url: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket(url)

        ws.current.onopen = () => {
          console.log('[v0] WebSocket connected')
          setConnected(true)
        }

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('[v0] WebSocket message received:', data)

            if (data.type === 'alert_update') {
              setAlerts((prev) => {
                const exists = prev.find((a) => a.id === data.alert.id)
                if (exists) {
                  // Update existing alert
                  return prev.map((a) =>
                    a.id === data.alert.id ? data.alert : a,
                  )
                } else {
                  // Add new alert
                  return [data.alert, ...prev]
                }
              })
            } else if (data.type === 'all_alerts') {
              setAlerts(data.alerts)
            }
          } catch (err) {
            console.error('[v0] Error parsing WebSocket message:', err)
          }
        }

        ws.current.onerror = (error) => {
          console.error('[v0] WebSocket error:', error)
        }

        ws.current.onclose = () => {
          console.log('[v0] WebSocket disconnected')
          setConnected(false)
          // Attempt reconnection after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }
      } catch (err) {
        console.error('[v0] Failed to connect to WebSocket:', err)
      }
    }

    connectWebSocket()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  const resolveAlert = (alertId: string) => {
    if (ws.current && connected) {
      ws.current.send(
        JSON.stringify({
          type: 'resolve_alert',
          alertId,
        }),
      )
    }
  }

  return { alerts, connected, resolveAlert }
}
