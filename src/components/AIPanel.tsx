'use client';
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Send, Zap, Radio, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface RoomData { id: string; name: string; capacity: number; }
interface QueueData { id: string; name: string; waitTime: number; status: string; }
interface AIPanelProps { crowdData: RoomData[]; queues: QueueData[]; mobileMode?: boolean; }
type Tab = 'chat' | 'feed';
type FeedItem = { time: string; text: string; type: 'alert' | 'info' };

const AIPanel = ({ crowdData, queues, mobileMode = false }: AIPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [hasNewFeed, setHasNewFeed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live feed generator
  useEffect(() => {
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (feed.length === 0) {
      setFeed([{ time: now(), type: 'info', text: 'VenueFlowAI monitoring initialized. All systems active.' }]);
    }

    const id = setInterval(() => {
      let item: FeedItem;
      if (crowdData.length > 0 && Math.random() > 0.5) {
        const worst = [...crowdData].sort((a, b) => b.capacity - a.capacity)[0];
        item = worst.capacity > 70
          ? { time: now(), type: 'alert', text: `${worst.name} is at critical capacity (${worst.capacity}%). Rerouting recommended.` }
          : { time: now(), type: 'info', text: `${worst.name} traffic is manageable at ${worst.capacity}%.` };
      } else if (queues.length > 0) {
        const best = [...queues].sort((a, b) => a.waitTime - b.waitTime)[0];
        item = { time: now(), type: 'info', text: `Shortest wait right now: ${best.name} at only ${best.waitTime} min.` };
      } else {
        item = { time: now(), type: 'info', text: 'All venue systems operating normally.' };
      }
      setFeed(prev => [...prev.slice(-20), item]);
      if (activeTab !== 'feed') setHasNewFeed(true);
    }, 7000);
    return () => clearInterval(id);
  }, [crowdData, queues, activeTab]);

  useEffect(() => {
    if (activeTab === 'feed') { setHasNewFeed(false); }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed, messages, activeTab]);

  const worstRoom = crowdData.length > 0
    ? [...crowdData].sort((a, b) => b.capacity - a.capacity)[0]
    : { name: 'Food Court', capacity: 91 };

  const suggestions = [
    "Where's the shortest food line?",
    "Which exit is least crowded?",
    "Is VIP busy right now?",
  ];

  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, crowdData, queues }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, crowdData, queues]);

  return (
    <aside className={`${mobileMode ? 'w-full' : 'w-80'} h-full flex flex-col`}
      style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-subtle)' }}>

      {/* Header */}
      <div className="p-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>VenueFlow Assistant</h2>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Powered by Gemini AI</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {(['chat', 'feed'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all relative"
              style={{
                background: activeTab === tab ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                color: activeTab === tab ? '#A78BFA' : 'var(--text-muted)',
                border: activeTab === tab ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {tab === 'chat' ? <><Zap size={12} /> AI Chat</> : <><Radio size={12} className={activeTab === 'feed' ? 'text-red-400' : ''} /> Live Feed</>}
              {tab === 'feed' && hasNewFeed && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'chat' && (
          <>
            {/* Live insight card */}
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#F87171' }}>⚡ Live Insight</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#F87171', fontWeight: 600 }}>{worstRoom.name}</span> is at{' '}
                <span style={{ color: '#F87171', fontWeight: 700 }}>{worstRoom.capacity}%</span> capacity. Route around this area.
              </p>
            </div>

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                    color: msg.role === 'user' ? '#DDD6FE' : 'var(--text-secondary)',
                    border: msg.role === 'user' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                  }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#A78BFA', animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Try asking</p>
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all"
                    style={{ background: 'rgba(124,58,237,0.06)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.15)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.14)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)'; }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-2">
            {feed.map((item, i) => (
              <div key={i} className="flex gap-2.5 p-3 rounded-xl text-xs"
                style={{
                  background: item.type === 'alert' ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)',
                  border: item.type === 'alert' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                <div className="mt-0.5 flex-shrink-0">
                  {item.type === 'alert'
                    ? <AlertTriangle size={13} style={{ color: '#F87171' }} />
                    : <Info size={13} style={{ color: '#67E8F9' }} />}
                </div>
                <div>
                  <span className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                  <p style={{ color: item.type === 'alert' ? '#FECACA' : 'var(--text-secondary)' }}>{item.text}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      {activeTab === 'chat' && (
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about any venue area..."
              disabled={isTyping}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(124,58,237,0.2)' }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.2)'; }}
            />
            <button onClick={() => handleSend()} disabled={isTyping || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default memo(AIPanel);
