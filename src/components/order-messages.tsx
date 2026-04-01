"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"

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

  const quickReplies = {
    pharmacy: [
      "Order is ready for pickup",
      "Item is currently out of stock",
      "Need clarify on prescription",
      "Preparation delayed by 15 mins"
    ],
    admin: [
      "Courier is dispatched",
      "Please expedite: High Priority",
      "Customer requested call-back",
      "Payment verification complete"
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    loadMessages()
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
          if (userRole === 'pharmacy' && newMsg.is_internal) return
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, userRole])

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

  const sendMessage = async (text?: string) => {
    const finalMsg = text || newMessage.trim()
    if (!finalMsg) return

    try {
      setSending(true)
      const response = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: finalMsg })
      })

      if (!response.ok) throw new Error('Failed to send message')

      setNewMessage("")
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
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (date.getFullYear() === now.getFullYear()) {
       return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString()
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return <Badge variant="neutral" className="text-[9px] font-black uppercase tracking-widest bg-brand-indigo/10 text-brand-indigo border-none px-2 py-0">Admin</Badge>
      case 'pharmacy':
        return <Badge variant="neutral" className="text-[9px] font-black uppercase tracking-widest bg-brand-teal/10 text-brand-teal border-none px-2 py-0">Pharmacy</Badge>
      case 'system':
        return <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400 px-2 py-0">Pulse</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="p-0 border-none bg-transparent shadow-none space-y-6">
      {/* Messages List */}
      <div className="space-y-6 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand-indigo/20" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Encrypting Stream...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
             <MessageSquare className="h-10 w-10 text-slate-100 mx-auto mb-3" />
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No communications recorded</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = 
              (userRole === 'admin' && msg.sender_type === 'admin') ||
              (userRole === 'pharmacy' && msg.sender_type === 'pharmacy')
            const isSystem = msg.sender_type === 'system'

            if (isSystem) {
               return (
                  <div key={msg.id} className="flex flex-col items-center gap-2 py-2">
                     <div className="flex items-center gap-3 w-full">
                        <div className="h-px bg-slate-100 flex-1" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{formatTime(msg.created_at)}</span>
                        <div className="h-px bg-slate-100 flex-1" />
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 px-4 text-center leading-relaxed">
                        {msg.message}
                     </p>
                  </div>
               )
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center gap-3 mb-1.5 px-1">
                  {!isOwnMessage && getSenderBadge(msg.sender_type)}
                  <span className={`text-[9px] font-bold text-slate-400 tabular-nums ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                    {formatTime(msg.created_at)}
                  </span>
                  {isOwnMessage && getSenderBadge(msg.sender_type)}
                </div>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm transition-all",
                    isOwnMessage
                      ? 'bg-brand-indigo text-white rounded-tr-none'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none hover:border-slate-200'
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Prompts */}
      {!loading && (
        <div className="flex flex-wrap gap-2 px-1">
           {quickReplies[userRole].map((reply, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => sendMessage(reply)}
                disabled={sending}
                className="h-8 rounded-full border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-brand-indigo transition-all"
              >
                 {reply}
              </Button>
           ))}
        </div>
      )}

      {/* Message Input Container */}
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo/20 to-brand-teal/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
         <div className="relative flex items-end gap-2 bg-white p-3 rounded-[1.5rem] border border-slate-200 shadow-sm focus-within:border-brand-indigo/50 transition-all">
            <Textarea
              placeholder={`Communicate with ${userRole === 'admin' ? 'pharmacy node' : 'central command'}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              rows={1}
              className="min-h-[44px] max-h-[120px] resize-none border-none focus-visible:ring-0 shadow-none font-medium text-slate-600 bg-transparent py-3"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-11 w-11 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark shrink-0 shadow-lg shadow-brand-indigo/20 transition-all active:scale-95"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
            </Button>
         </div>
      </div>
    </Card>
  )
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)
