"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Clock, Loader2, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
  const [isConnected, setIsConnected] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickReplies = {
    pharmacy: [
      "Ready for pickup",
      "Out of stock",
      "Clarify Rx",
      "Delayed 15m"
    ],
    admin: [
      "Courier out",
      "Expedite: High Priority",
      "User Callback",
      "Paid"
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView()
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
            const next = [...prev, newMsg]
            return next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          })
        }
      )
      .subscribe((status: any) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

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
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('[Chat] Error loading messages:', error)
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
        body: JSON.stringify({ 
          message: finalMsg,
          is_internal: userRole === 'admin' ? isInternal : false
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Failed to send",
        description: "Retry sending.",
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
    
    if (minutes < 1) return 'Now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return <Badge variant="neutral" className="text-[8px] font-black uppercase tracking-widest bg-brand-teal/10 text-brand-teal border-none px-2 py-0">Admin</Badge>
      case 'pharmacy':
        return <Badge variant="neutral" className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border-none px-2 py-0">Pharmacy</Badge>
      case 'system':
        return <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-300 px-2 py-0">System</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="p-0 border-none bg-transparent shadow-none flex flex-col h-full overflow-hidden">
      {/* Header / Connection Status */}
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex items-center gap-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
              {isConnected ? "Active" : "Offline"}
            </span>
         </div>
         {loading && <Loader2 className="h-3 w-3 animate-spin text-slate-200" />}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto px-1 space-y-6">
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-slate-100" />
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Fetching logs...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-100 rounded-xl">
             <MessageSquare className="h-8 w-8 text-slate-100 mx-auto mb-2" />
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No active communications</p>
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
                     <div className="flex items-center gap-3 w-full opacity-30">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{formatTime(msg.created_at)}</span>
                        <div className="h-px bg-slate-200 flex-1" />
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 px-6 text-center leading-relaxed uppercase tracking-tight">
                        {msg.message}
                     </p>
                  </div>
               )
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  {!isOwnMessage && getSenderBadge(msg.sender_type)}
                  <span className={`text-[8px] font-bold text-slate-300 tabular-nums ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                    {formatTime(msg.created_at)}
                  </span>
                  {isOwnMessage && getSenderBadge(msg.sender_type)}
                </div>
                <div
                  className={cn(
                    "px-4 py-3 rounded-xl max-w-[90%] text-xs font-bold shadow-sm",
                    isOwnMessage
                      ? (msg.is_internal ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tr-none' : 'bg-brand-teal text-white rounded-tr-none')
                      : (msg.is_internal ? 'bg-amber-50 text-amber-900 border border-amber-100 rounded-tl-none' : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none')
                  )}
                >
                  {msg.is_internal && (
                    <div className="flex items-center gap-1 mb-1 opacity-60">
                      <ShieldAlert className="h-3 w-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Internal</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Selection */}
      {!loading && (
        <div className="grid grid-cols-2 gap-2 mt-8 px-1">
           {quickReplies[userRole].map((reply, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => sendMessage(reply)}
                disabled={sending}
                className="h-8 rounded-full border-slate-100 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-brand-teal hover:border-brand-teal/30 text-left justify-start px-3 truncate"
              >
                 {reply}
              </Button>
           ))}
        </div>
      )}

      {/* Primary Input Container */}
      <div className="mt-6 space-y-3">
         {userRole === 'admin' && (
           <div className="flex items-center gap-2 px-2">
             <Switch 
               id="internal-mode" 
               checked={isInternal} 
               onCheckedChange={setIsInternal}
               className="data-[state=checked]:bg-amber-500 h-4 w-8"
             />
             <Label htmlFor="internal-mode" className="text-[9px] font-black uppercase tracking-widest text-slate-300 cursor-pointer flex items-center gap-1.5">
               Internal Note <ShieldAlert className={cn("h-3 w-3", isInternal ? "text-amber-500" : "text-slate-200")} />
             </Label>
           </div>
         )}
         <div className={cn(
           "flex items-end gap-2 p-3 rounded-xl border",
           isInternal ? "bg-amber-50/50 border-amber-200" : "bg-slate-50/50 border-slate-100 focus-within:border-brand-teal/50 focus-within:bg-white"
         )}>
            <Textarea
              placeholder={isInternal ? "Internal Note..." : "Message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              rows={1}
              className="min-h-[40px] max-h-[100px] resize-none border-none focus-visible:ring-0 shadow-none font-black text-xs uppercase tracking-widest text-slate-600 bg-transparent py-2 placeholder:text-slate-200"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full shrink-0 shadow-sm",
                isInternal ? "bg-amber-500 hover:bg-amber-600" : "bg-brand-teal hover:bg-brand-teal/90"
              )}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
         </div>
      </div>
    </Card>
  )
}
