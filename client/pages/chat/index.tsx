import { useState, useEffect, useContext } from 'react'
import { API_URL, WEBSOCKET_URL } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import { AuthContext } from '@/modules/auth_provider'
import { WebsocketContext } from '@/modules/websocket_provider'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, LogIn, Loader2 } from 'lucide-react'

const Chat = () => {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([])
  const [roomName, setRoomName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useContext(AuthContext)
  const { setConn } = useContext(WebsocketContext)
  const router = useRouter()

  const getRooms = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/ws/get-rooms`, {
        method: 'GET',
      })
      const data = await res.json()
      if (res.ok) {
        setRooms(data)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
  }, [])

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!roomName.trim()) return
    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/ws/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: uuidv4(),
          name: roomName,
        }),
      })
      if (res.ok) {
        setRoomName('')
        await getRooms()
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const joinRoom = (roomId: string) => {
    const ws = new WebSocket(
      `${WEBSOCKET_URL}/ws/join-room/${roomId}?userId=${user.id}&username=${user.username}`
    )
    if (ws.OPEN) {
      setConn(ws)
      router.push('/chat/[room]', `/chat/${roomId}`)
      return
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-slate-800/80 backdrop-blur-md text-slate-100 shadow-lg shadow-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-400">Chat Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitHandler} className="flex space-x-2 mb-6">
              <Input
                type="text"
                className="flex-grow bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4 mr-2" />
                )}
                Create Room
              </Button>
            </form>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-400">Available Rooms</h2>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-slate-700 hover:bg-slate-600 transition-colors duration-200">
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="text-sm text-slate-400">Room</p>
                            <p className="text-lg font-semibold text-purple-400">{room.name}</p>
                          </div>
                          <Button
                            onClick={() => joinRoom(room.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Join
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Chat