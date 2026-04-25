'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message { id: string; sender: string; text: string; time: string; }

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'Jake_M', text: 'Food court line is moving fast now!', time: '9:41 PM' },
  { id: '2', sender: 'SaraV', text: 'VIP lounge has great spots, barely anyone there', time: '9:42 PM' },
  { id: '3', sender: 'Alex99', text: 'North exit is clear if anyone needs to leave early', time: '9:43 PM' },
  { id: '4', sender: 'PriyaK', text: 'Merch line is super long, maybe wait till later', time: '9:44 PM' },
];

export default function GlobalChat() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const userName = typeof window !== 'undefined' ? (localStorage.getItem('userName') || 'You') : 'You';

  // Simulate incoming messages
  useEffect(() => {
    const senders = ['Mike_L', 'TeamFan', 'ConcertGoer', 'NightOwl', 'VIPPass'];
    const texts = [
      'Section 5 is amazing tonight!',
      'Anyone know the set times?',
      'Bar 12 is really quick right now',
      'Restrooms near Gate C have no wait',
      'East entrance is fully clear',
    ];
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev.slice(-50), {
        id: Date.now().toString(),
        sender: senders[Math.floor(Math.random() * senders.length)],
        text: texts[Math.floor(Math.random() * texts.length)],
        time: now,
      }]);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: userName, text: input, time: now }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid rgba(124,58,237,0.15)' }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(124,58,237,0.12)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}>
            <MessageCircle size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Global Chat</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>14,203 attendees connected</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
          <span className="text-[11px] font-bold" style={{ color: '#34D399' }}>LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {messages.map((msg, i) => {
          const isMe = msg.sender === userName;
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold" style={{ color: isMe ? '#A78BFA' : '#67E8F9' }}>{msg.sender}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{msg.time}</span>
              </div>
              <div className="max-w-xl rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: isMe ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
                  color: isMe ? '#DDD6FE' : 'var(--text-secondary)',
                  border: isMe ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  borderBottomRightRadius: isMe ? 4 : undefined,
                  borderBottomLeftRadius: !isMe ? 4 : undefined,
                }}>
                {msg.text}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(124,58,237,0.12)' }}>
        <div className="flex gap-3 items-center">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Send a message to the venue..."
            className="flex-1 text-sm px-4 py-3 rounded-xl outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(124,58,237,0.2)' }}
            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'; }}
            onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.2)'; }} />
          <button onClick={handleSend}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
