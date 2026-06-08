import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { messageAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

interface Message {
  _id: string
  content: string
  type: 'text' | 'image' | 'file'
  isRead: boolean
  createdAt: string
  sender: { _id: string; name: string; avatar?: string; role: string }
}

interface Conversation {
  _id: string
  participants: { _id: string; name: string; avatar?: string; isOnline: boolean; role: string }[]
  lastMessage?: { content: string }
  updatedAt: string
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'

const Chat = () => {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    // Socket bağlantısı
    const token = localStorage.getItem('medi_token')
    socketRef.current = io(SOCKET_URL, { auth: { token } })

    socketRef.current.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    socketRef.current.on('userTyping', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== user.id) {
        setTypingUser(isTyping ? userId : null)
      }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user])

  // Konuşmaları getir
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await messageAPI.getConversations()
        setConversations(res.data.conversations)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchConversations()
  }, [])

  // Seçili konuşmanın mesajlarını getir
  useEffect(() => {
    if (!conversationId) return
    const fetchMessages = async () => {
      try {
        const res = await messageAPI.getMessages(conversationId)
        setMessages(res.data.messages)
        socketRef.current?.emit('joinConversation', conversationId)
      } catch (e) { console.error(e) }
    }
    fetchMessages()
  }, [conversationId])

  // Yeni mesaj gelince aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || sending) return
    setSending(true)
    try {
      socketRef.current?.emit('sendMessage', {
        conversationId,
        content: newMessage.trim(),
        type: 'text',
      })
      setNewMessage('')
    } finally { setSending(false) }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    if (!conversationId) return
    socketRef.current?.emit('typing', { conversationId, isTyping: true })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { conversationId, isTyping: false })
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const getOtherParticipant = (conv: Conversation) => conv.participants.find(p => p._id !== user?.id)

  const activeConversation = conversations.find(c => c._id === conversationId)
  const otherParticipant = activeConversation ? getOtherParticipant(activeConversation) : null

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16 h-screen">

        {/* Sol — Konuşma listesi */}
        <div className="w-80 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest">
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="font-headline text-lg font-bold text-on-surface">Mesajlar</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-surface-container rounded w-24 mb-2" />
                      <div className="h-2 bg-surface-container rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">chat_bubble</span>
                <p className="text-sm text-on-surface-variant">Henüz mesajınız yok</p>
                <Link to="/doctors" className="text-xs text-primary font-semibold hover:underline mt-2 block">
                  Doktor bul →
                </Link>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv)
                const isActive = conv._id === conversationId
                return (
                  <Link key={conv._id} to={`/chat/${conv._id}`}
                    className={`flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                        {other?.name.charAt(0)}
                      </div>
                      {other?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white pulse-online" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                          {other?.name}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {new Date(conv.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">
                        {conv.lastMessage?.content || 'Konuşma başlat'}
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Sağ — Mesaj alanı */}
        {conversationId && otherParticipant ? (
          <div className="flex-1 flex flex-col bg-surface">

            {/* Header */}
            <div className="p-4 border-b border-outline-variant/30 glass-card rounded-none flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                  {otherParticipant.name.charAt(0)}
                </div>
                {otherParticipant.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white pulse-online" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-on-surface">{otherParticipant.name}</h3>
                <p className="text-xs text-on-surface-variant">
                  {otherParticipant.isOnline ? '🟢 Çevrimiçi' : 'Çevrimdışı'}
                </p>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.sender._id === user.id
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container mr-2 flex-shrink-0 self-end">
                        {msg.sender.name.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-surface-container-lowest text-on-surface rounded-bl-sm border border-outline-variant/30'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-xs text-on-surface-variant mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <span className="ml-1 material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>
                            {msg.isRead ? 'done_all' : 'check'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Yazıyor göstergesi */}
              {typingUser && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-outline animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj gönder */}
            <div className="p-4 border-t border-outline-variant/30 glass-card rounded-none">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-surface-container-low rounded-2xl border border-outline-variant/30 px-4 py-2.5 flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={e => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Mesajınızı yazın..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-on-surface outline-none resize-none max-h-32"
                    style={{ minHeight: '24px' }}
                  />
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-xl flex-shrink-0">
                    attach_file
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-50 active:scale-95 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-xl" style={{fontVariationSettings:"'FILL' 1"}}>send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-outline mb-4 block">chat_bubble</span>
              <h3 className="font-headline text-xl text-on-surface mb-2">Bir Konuşma Seçin</h3>
              <p className="text-sm text-on-surface-variant">Soldan bir konuşma seçerek mesajlaşmaya başlayın</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat