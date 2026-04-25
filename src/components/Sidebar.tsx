'use client';
import React from 'react';
import { LayoutDashboard, MessageSquare, Map, Bell, Settings, LogOut, Zap, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('auth');
    router.push('/login');
  };

  const handleComingSoon = (feature: string) => {
    alert(`${feature} feature is coming soon!`);
  };

  return (
    <aside className="w-64 h-full flex flex-col pt-6 pb-6 px-3" style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border-subtle)' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <div>
          <h1 className="text-base font-bold gradient-text">VenueFlowAI</h1>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Smart Venue Companion</p>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="mx-3 mb-6 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10B981' }}></span>
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#10B981' }}></span>
        </span>
        <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Live · 14,203 attendees</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavItem icon={<MessageSquare size={18} />} label="Global Chat" active={activeView === 'chat'} onClick={() => setActiveView('chat')} />
        <NavItem icon={<Map size={18} />} label="Floor Map" active={activeView === 'map'} onClick={() => setActiveView('map')} />
        <NavItem icon={<Bell size={18} />} label="Alerts" active={activeView === 'alerts'} onClick={() => setActiveView('alerts')} />
      </nav>

      {/* Order CTA */}
      <div className="mx-1 mb-4">
        <button onClick={() => setActiveView('order')} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
          <ShoppingCart size={15} /> Order to Seat
        </button>
      </div>

      {/* Bottom */}
      <div className="space-y-1 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <NavItem icon={<LogOut size={17} />} label="Sign Out" subtle onClick={handleSignOut} />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false, subtle = false, badge, onClick }:
  { icon: React.ReactNode; label: string; active?: boolean; subtle?: boolean; badge?: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${subtle ? 'py-2' : ''}`}
      style={{
        background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
        color: active ? '#A78BFA' : subtle ? 'var(--text-muted)' : 'var(--text-secondary)',
        border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.07)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = subtle ? 'var(--text-muted)' : 'var(--text-secondary)'; } }}
    >
      <span className="flex items-center gap-3">
        <span style={{ color: active ? '#A78BFA' : 'inherit' }}>{icon}</span>
        {label}
      </span>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          {badge}
        </span>
      )}
    </button>
  );
}
