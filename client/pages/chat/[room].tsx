import React, { useState, useRef, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { WebsocketContext } from '@/modules/websocket_provider'
import { AuthContext } from '@/modules/auth_provider'
import { UserIcon, LogOut, Send } from 'lucide-react'

export type Message = {
  content: string
  client_id: string
  username: string
  room_id: string
  type: 'recv' | 'self'
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [inputMessage, setInputMessage] = useState('')
  const { conn, connectWebSocket } = useContext(WebsocketContext)
  const { user, authenticated, logout } = useContext(AuthContext)
  const [users, setUsers] = useState<Array<{ username: string }>>([])
  const router = useRouter()
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
      return
    }

    const { roomId } = router.query
    if (roomId && typeof roomId === 'string') {
      connectWebSocket(roomId)
    }
  }, [authenticated, router, connectWebSocket])

  useEffect(() => {
    if (!conn) return

    const handleMessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data)
      if (message.content === 'A new user has joined the room') {
        setUsers((prevUsers) => [...prevUsers, { username: message.username }])
        toast({
          title: "New User",
          description: `${message.username} has joined the chat.`,
        })
      } else if (message.content === 'user left the chat') {
        setUsers((prevUsers) => prevUsers.filter((user) => user.username !== message.username))
        toast({
          title: "User Left",
          description: `${message.username} has left the chat.`,
        })
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...message,
            type: user?.username === message.username ? 'self' : 'recv',
          },
        ])
      }
    }

    conn.addEventListener('message', handleMessage)

    return () => {
      conn.removeEventListener('message', handleMessage)
    }
  }, [conn, user, toast])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (!inputMessage.trim() || !conn) return
    conn.send(JSON.stringify({
      content: inputMessage,
      username: user.username,
      room_id: router.query.roomId,
    }))
    setInputMessage('')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-slate-800/80 backdrop-blur-md text-slate-100 shadow-lg shadow-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-purple-400">Chat Room</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium">{users.length} Users</span>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[60vh] pr-4 mb-4" ref={scrollAreaRef}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 ${msg.type === 'self' ? 'text-right' : 'text-left'}`}
                >
                  <span className={`inline-block p-2 rounded-lg ${
                    msg.type === 'self' ? 'bg-purple-600' : 'bg-slate-700'
                  }`}>
                    <strong>{msg.username}: </strong>{msg.content}
                  </span>
                </motion.div>
              ))}
            </ScrollArea>
            <div className="mt-4 flex">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here"
                className="flex-grow mr-2 bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ChatPage