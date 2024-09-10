import React, { useState, createContext, useCallback } from 'react'
import { WEBSOCKET_URL } from '@/constants'

type Conn = WebSocket | null

type WebsocketContextType = {
  conn: Conn
  setConn: (c: Conn) => void
  connectWebSocket: (roomId: string) => void
}

export const WebsocketContext = createContext<WebsocketContextType>({
  conn: null,
  setConn: () => {},
  connectWebSocket: () => {},
})

const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conn, setConn] = useState<Conn>(null)

  const connectWebSocket = useCallback((roomId: string) => {
    const ws = new WebSocket(`${WEBSOCKET_URL}/ws/chat/${roomId}`)
    ws.onopen = () => {
      console.log('WebSocket Connected')
      setConn(ws)
    }
    ws.onclose = () => {
      console.log('WebSocket Disconnected')
      setConn(null)
    }
    ws.onerror = (error) => {
      console.error('WebSocket Error:', error)
    }
  }, [])

  return (
    <WebsocketContext.Provider
      value={{
        conn,
        setConn,
        connectWebSocket,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  )
}

export default WebSocketProvider