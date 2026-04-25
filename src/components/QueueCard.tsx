'use client';
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Users, ShoppingBag, Wine, Navigation } from 'lucide-react';

type Status = 'LOW' | 'MEDIUM' | 'HIGH';

interface QueueCardProps {
  id: string;
  name: string;
  location: string;
  type: 'dining' | 'restroom' | 'merchandise' | 'bar';
  waitTime: number;
  status: Status;
  description: string;
  actionText: string;
}

const statusConfig = {
  LOW:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  text: '#34D399', label: 'QUIET',    bar: '#10B981' },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#FCD34D', label: 'BUSY',     bar: '#F59E0B' },
  HIGH:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#F87171', label: 'CROWDED',  bar: '#EF4444' },
};

const typeIcon = {
  dining:      <Utensils size={16} />,
  restroom:    <Users size={16} />,
  merchandise: <ShoppingBag size={16} />,
  bar:         <Wine size={16} />,
};

const typeColor = {
  dining:      { bg: 'rgba(16,185,129,0.12)',  color: '#34D399' },
  restroom:    { bg: 'rgba(239,68,68,0.12)',    color: '#F87171' },
  merchandise: { bg: 'rgba(99,102,241,0.12)',   color: '#A5B4FC' },
  bar:         { bg: 'rgba(245,158,11,0.12)',   color: '#FCD34D' },
};

const QueueCard = ({ name, location, type, waitTime, status, description, actionText }: QueueCardProps) => {
  const sc = statusConfig[status];
  const tc = typeColor[type];
  const progress = Math.min((waitTime / 30) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 cursor-pointer group"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.12)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(124,58,237,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(124,58,237,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: sc.bar }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tc.bg, color: tc.color }}>
            {typeIcon[type]}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</h3>
            <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>{location}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
          {sc.label}
        </span>
      </div>

      {/* Wait time + progress */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl font-black" style={{ color: sc.bar }}>{waitTime}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>min wait</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${sc.bar}cc, ${sc.bar})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Description + CTA */}
      <div className="flex items-center justify-between">
        <p className="text-xs leading-relaxed max-w-[65%]" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        <button
          onClick={() => alert(`${actionText}: ${name}`)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.25)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.15)'; }}
        >
          <Navigation size={11} /> {actionText}
        </button>
      </div>
    </motion.div>
  );
};

export default memo(QueueCard);
