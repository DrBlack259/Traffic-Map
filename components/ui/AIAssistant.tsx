'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Loader2 } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { formatDistance, formatDuration } from '@/lib/utils/distance'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildContext(store: ReturnType<typeof useMapStore.getState>) {
  return {
    route: store.route
      ? {
          origin: store.origin?.name ?? 'Unknown',
          destination: store.destination?.name ?? 'Unknown',
          distance: formatDistance(store.route.distance),
          duration: formatDuration(store.route.duration),
          mode: store.route.mode,
        }
      : null,
    incidents: store.incidents.slice(0, 5).map((i) => `${i.type} on ${i.roadName ?? 'road'}`),
    location: store.userLocation
      ? `${store.userLocation[0].toFixed(4)}, ${store.userLocation[1].toFixed(4)}`
      : null,
  }
}

export default function AIAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setStreaming(true)

    const placeholder: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, placeholder])

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: buildContext(useMapStore.getState()),
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const { text } = JSON.parse(payload)
            assistantText += text
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: assistantText }
              return updated
            })
          } catch {
            // ignore
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I could not connect. Check your ANTHROPIC_API_KEY.',
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[700] px-3 pb-5 animate-slide-up">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Bot size={16} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">AI Navigation Assistant</div>
            <div className="text-xs text-gray-500">Powered by Claude</div>
          </div>
          <button onClick={onClose} className="icon-btn w-8 h-8"><X size={14} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="space-y-2 text-center py-6">
              <p className="text-gray-400 text-sm">Ask me anything about your route</p>
              {['What\'s the fastest route?', 'Any gas stations nearby?', 'How\'s the traffic?'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-white text-black rounded-br-sm'
                    : 'bg-white/8 text-gray-200 rounded-bl-sm'
                }`}
              >
                {m.content || (streaming && i === messages.length - 1
                  ? <Loader2 size={14} className="animate-spin text-gray-400" />
                  : null)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/8 flex-shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about your route…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="icon-btn w-9 h-9 disabled:opacity-30"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
