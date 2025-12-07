"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"

interface Message {
  id: number
  sender_type: 'admin' | 'pharmacy' | 'system'
  message: string
  created_at: string
  is_internal?: boolean
}

interface OrderMessagesProps {
  orderId: number
  userRole: 'admin' | 'pharmacy'
}

export function OrderMessages({ orderId, userRole }: OrderMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
  }, [orderId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}/messages`)
      if (!response.ok) throw new Error('Failed to load messages')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`order_messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload: any) => {
          const newMsg = payload.new as Message
          // Filter internal messages for pharmacy users
          if (userRole === 'pharmacy' && newMsg.is_internal) return
          setMessages(prev => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const response = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() })
      })

      if (!response.ok) throw new Error('Failed to send message')

      setNewMessage("")
      toast({
        title: "Message sent",
        description: "Your message has been delivered."
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Failed to send",
        description: "Could not send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes < 1 ? 'Just now' : `${minutes}m ago`
    }
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return <Badge variant="default" className="text-xs">Admin</Badge>
      case 'pharmacy':
        return <Badge variant="secondary" className="text-xs">Pharmacy</Badge>
      case 'system':
        return <Badge variant="outline" className="text-xs">System</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Order Communication</h3>
      </div>

      {/* Messages List */}
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = 
              (userRole === 'admin' && msg.sender_type === 'admin') ||
              (userRole === 'pharmacy' && msg.sender_type === 'pharmacy')

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getSenderBadge(msg.sender_type)}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : msg.sender_type === 'system'
                      ? 'bg-muted/50 text-muted-foreground border border-border'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <Textarea
          placeholder={`Send a message to ${userRole === 'admin' ? 'pharmacy' : 'admin'}...`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          rows={2}
          className="resize-none"
        />
        <Button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </Card>
  )
}
