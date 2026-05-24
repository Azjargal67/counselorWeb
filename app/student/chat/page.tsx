"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { AppTopbar } from "@/components/app-topbar"
import { useAuth } from "@/lib/auth-context"
import { Search, Send, CheckCheck, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface Contact { id: string; name: string; role: string; grade?: string }
interface ConvData { id: string; otherId: string; otherName: string; otherRole: string; otherGrade?: string; lastMessage: string; lastMessageAt: string; unread: number }
interface ChatMsg { id: string; senderId: string; senderName: string; senderRole: string; content: string; read: boolean; createdAt: string }

const roleLabel: Record<string, string> = { counselor: "Зөвлөх", teacher: "Багш", student: "Сурагч" }
const avatarBg: Record<string, string> = { counselor: "bg-[#4361EE]", teacher: "bg-[#4A8C4D]", student: "bg-[#C07A8B]" }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })
}
function formatLast(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 86400000) return formatTime(iso)
  if (diff < 172800000) return "Өчигдөр"
  return new Date(iso).toLocaleDateString("mn-MN", { month: "short", day: "numeric" })
}

export default function StudentChatPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [conversations, setConversations] = useState<ConvData[]>([])
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeContactId, setActiveContactId] = useState<string | null>(null)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const lastMsgAtRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/chat/contacts").then(r => r.json()).then(d => setContacts(d.contacts ?? []))
    fetch("/api/chat/conversations").then(r => r.json()).then(d => setConversations(d.conversations ?? []))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMsgs = useCallback(async (convId: string, after?: string) => {
    try {
      const url = after
        ? `/api/chat/messages?convId=${convId}&after=${encodeURIComponent(after)}`
        : `/api/chat/messages?convId=${convId}`
      const res = await fetch(url)
      const data = await res.json()
      const msgs: ChatMsg[] = data.messages ?? []
      if (after) {
        if (msgs.length > 0) {
          setMessages(prev => [...prev, ...msgs])
          lastMsgAtRef.current = msgs[msgs.length - 1].createdAt
          setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, lastMessage: msgs[msgs.length - 1].content, lastMessageAt: msgs[msgs.length - 1].createdAt, unread: 0 } : c
          ))
        }
      } else {
        setMessages(msgs)
        if (msgs.length > 0) lastMsgAtRef.current = msgs[msgs.length - 1].createdAt
        setLoadingMsgs(false)
      }
    } catch { setLoadingMsgs(false) }
  }, [])

  useEffect(() => {
    if (!activeConvId) return
    setLoadingMsgs(true)
    lastMsgAtRef.current = null
    fetchMsgs(activeConvId)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (lastMsgAtRef.current) fetchMsgs(activeConvId, lastMsgAtRef.current)
    }, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeConvId, fetchMsgs])

  const handleSelectContact = async (contact: Contact) => {
    setActiveContactId(contact.id)
    const existing = conversations.find(c => c.otherId === contact.id)
    if (existing) { setActiveConvId(existing.id); return }
    const res = await fetch("/api/chat/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: contact.id }),
    })
    const data = await res.json()
    if (data.conversationId) {
      setActiveConvId(data.conversationId)
      setConversations(prev => [{
        id: data.conversationId, otherId: contact.id, otherName: contact.name,
        otherRole: contact.role, otherGrade: contact.grade,
        lastMessage: "", lastMessageAt: new Date().toISOString(), unread: 0,
      }, ...prev])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeConvId) return
    const content = input.trim()
    setInput("")
    const res = await fetch("/api/chat/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convId: activeConvId, content }),
    })
    const data = await res.json()
    if (data.message) {
      setMessages(prev => [...prev, data.message])
      lastMsgAtRef.current = data.message.createdAt
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? { ...c, lastMessage: content, lastMessageAt: data.message.createdAt } : c
      ))
    }
  }

  const sidebarItems = useMemo(() => {
    return contacts
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .map(c => {
        const conv = conversations.find(cv => cv.otherId === c.id)
        return { contact: c, conv }
      })
      .sort((a, b) => {
        if (a.conv?.lastMessageAt && b.conv?.lastMessageAt) return new Date(b.conv.lastMessageAt).getTime() - new Date(a.conv.lastMessageAt).getTime()
        if (a.conv?.lastMessageAt) return -1
        if (b.conv?.lastMessageAt) return 1
        return 0
      })
  }, [contacts, conversations, search])

  const activeContact = contacts.find(c => c.id === activeContactId)

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Чат" />
      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col">
          <div className="p-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Хайх..."
                className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarItems.map(({ contact, conv }) => {
              const isActive = activeContactId === contact.id
              return (
                <button key={contact.id} onClick={() => handleSelectContact(contact)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors text-left border-b border-[#E2E8F0]",
                    isActive && "bg-[#F0F3FF] hover:bg-[#F0F3FF]"
                  )}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", avatarBg[contact.role] ?? "bg-[#E2E8F0]")}>
                    <span className="text-white text-sm font-semibold">{contact.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{contact.name}</p>
                      {conv?.lastMessageAt && <span className="text-[10px] text-[#64748B] flex-shrink-0 ml-1">{formatLast(conv.lastMessageAt)}</span>}
                    </div>
                    <p className="text-xs text-[#64748B] truncate">{conv?.lastMessage || roleLabel[contact.role]}</p>
                  </div>
                  {(conv?.unread ?? 0) > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4361EE] text-white text-[10px] font-bold flex items-center justify-center">
                      {conv!.unread}
                    </span>
                  )}
                </button>
              )
            })}
            {sidebarItems.length === 0 && (
              <p className="text-xs text-[#64748B] text-center py-8">Холбоо барих хүн байхгүй</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeContact ? (
            <div className="flex-1 flex items-center justify-center text-[#64748B] text-sm">Яриа сонгоно уу</div>
          ) : (
            <>
              {/* Header */}
              <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-5 gap-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", avatarBg[activeContact.role] ?? "bg-[#E2E8F0]")}>
                  <span className="text-white text-sm font-semibold">{activeContact.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A]">{activeContact.name}</p>
                  <p className="text-xs text-[#64748B]">{roleLabel[activeContact.role]}</p>
                </div>
                <button className="p-2 rounded-xl hover:bg-[#F8FAFC]"><MoreHorizontal className="w-4 h-4 text-[#64748B]" /></button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F8FAFC]">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-10 text-xs text-[#64748B]">Ачааллаж байна...</div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-xs text-[#64748B]">Мессеж байхгүй. Эхний мессежийг илгээнэ үү!</div>
                ) : messages.map(msg => {
                  const isMe = msg.senderId === user?.id
                  return (
                    <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                      {!isMe && (
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1", avatarBg[msg.senderRole] ?? "bg-[#E2E8F0]")}>
                          <span className="text-white text-[10px] font-bold">{msg.senderName.charAt(0)}</span>
                        </div>
                      )}
                      <div className={cn("max-w-sm flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          isMe ? "bg-[#4361EE] text-white rounded-br-sm" : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-sm"
                        )}>{msg.content}</div>
                        <div className={cn("flex items-center gap-1 px-1", isMe ? "justify-end" : "justify-start")}>
                          <span className="text-[10px] text-[#64748B]">{formatTime(msg.createdAt)}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-[#4A8C4D]" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-[#E2E8F0] p-4">
                <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Мессеж бичнэ үү..."
                    className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none" />
                  <button onClick={handleSend}
                    className={cn("flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                      input.trim() ? "bg-[#4361EE] text-white hover:bg-[#3451D1]" : "bg-[#E2E8F0] text-[#64748B] cursor-not-allowed")}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
