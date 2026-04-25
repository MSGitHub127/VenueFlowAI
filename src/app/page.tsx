'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AIPanel from '@/components/AIPanel';
import QueueCard from '@/components/QueueCard';
import CrowdMap from '@/components/CrowdMap';
import GlobalChat from '@/components/GlobalChat';
import FloorMap from '@/components/FloorMap';
import AlertsView from '@/components/AlertsView';
import OrderToSeat from '@/components/OrderToSeat';
import { LayoutDashboard, MessageSquare, Sparkles, X, Zap, TrendingDown, Users, Clock, Map, Bell } from 'lucide-react';

interface QueueData {
  id: string; name: string; location: string;
  type: 'dining' | 'restroom' | 'merchandise' | 'bar';
  waitTime: number; status: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string; actionText: string;
}
interface RoomData { id: string; name: string; capacity: number; }

export default function Dashboard() {
  const router = useRouter();
  const [queues, setQueues]       = useState<QueueData[]>([]);
  const [crowdData, setCrowdData] = useState<RoomData[]>([]);
  const [filter, setFilter]       = useState('ALL');
  const [activeView, setActiveView] = useState('dashboard');
  const [showMobileAI, setShowMobileAI] = useState(false);
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('auth')) { router.push('/login'); return; }
      setReady(true);
    }
    const fetchData = async () => {
      try {
        const [qRes, cRes] = await Promise.all([fetch('/api/queue-times'), fetch('/api/crowd-data')]);
        setQueues(await qRes.json());
        setCrowdData(await cRes.json());
      } catch { /* silent fail */ }
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [router]);

  const filtered = queues.filter(q => {
    if (filter === 'ALL')          return true;
    if (filter === 'DINING')       return q.type === 'dining';
    if (filter === 'RESTROOMS')    return q.type === 'restroom';
    if (filter === 'MERCHANDISE')  return q.type === 'merchandise';
    return true;
  });

  const avgWait     = queues.length    ? Math.round(queues.reduce((s, q) => s + q.waitTime, 0) / queues.length) : 0;
  const avgCapacity = crowdData.length ? Math.round(crowdData.reduce((s, r) => s + r.capacity, 0) / crowdData.length) : 0;
  const lowQueues   = queues.filter(q => q.status === 'LOW').length;

  if (!ready) return <div className="h-screen w-screen" style={{ background: 'var(--bg-base)' }} />;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full flex-shrink-0 z-10">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24 md:px-8 md:pt-8 md:pb-8">
        {activeView === 'dashboard' ? (
          <div className="w-full max-w-5xl mx-auto">

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}>
                  <Zap size={13} className="text-white" fill="white" />
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>VenueFlowAI</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Live Queue Intelligence
              </h1>
              <p className="mt-2 text-sm max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                Real-time crowd monitoring powered by Google Gemini. Move smarter, enjoy more.
              </p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Clock size={15}/>,       label:'Avg Wait',     value:`${avgWait}m`,     color:'#A78BFA', bg:'rgba(124,58,237,0.1)',  border:'rgba(124,58,237,0.2)'  },
                { icon: <Users size={15}/>,       label:'Avg Capacity', value:`${avgCapacity}%`, color:'#67E8F9', bg:'rgba(6,182,212,0.1)',   border:'rgba(6,182,212,0.2)'   },
                { icon: <TrendingDown size={15}/>, label:'Quiet Spots', value:`${lowQueues}`,    color:'#34D399', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.2)'  },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color:'var(--text-muted)' }}>{s.label}</p>
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
              {[
                { key:'ALL',         label:'All Facilities' },
                { key:'DINING',      label:'Dining'         },
                { key:'RESTROOMS',   label:'Restrooms'      },
                { key:'MERCHANDISE', label:'Merchandise'    },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="px-4 py-2 rounded-full text-xs font-bold tracking-wider whitespace-nowrap flex-shrink-0 transition-all"
                  style={{
                    background: filter === f.key ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : 'rgba(255,255,255,0.04)',
                    color:      filter === f.key ? 'white' : 'var(--text-muted)',
                    border:     filter === f.key ? '1px solid transparent' : '1px solid rgba(124,58,237,0.15)',
                    boxShadow:  filter === f.key ? '0 4px 15px rgba(124,58,237,0.3)' : 'none',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Queue Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {filtered.length > 0
                ? filtered.map(q => <QueueCard key={q.id} {...q} />)
                : queues.length === 0
                  ? Array(4).fill(0).map((_,i) => (
                      <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background:'var(--bg-card)' }} />
                    ))
                  : <p className="text-sm col-span-2" style={{ color:'var(--text-muted)' }}>No facilities match this filter.</p>
              }
            </div>

            {/* Crowd Map with Google Maps */}
            <CrowdMap crowdData={crowdData} />
          </div>
        ) : activeView === 'map' ? (
          <FloorMap crowdData={crowdData} />
        ) : activeView === 'alerts' ? (
          <AlertsView crowdData={crowdData} queues={queues} />
        ) : activeView === 'order' ? (
          <OrderToSeat />
        ) : (
          <div className="w-full max-w-4xl mx-auto h-[calc(100dvh-120px)] md:h-[calc(100dvh-64px)]">
            <GlobalChat />
          </div>
        )}
      </main>

      {/* Desktop AI Panel */}
      <div className="hidden lg:block h-full flex-shrink-0 z-10">
        <AIPanel crowdData={crowdData} queues={queues} />
      </div>

      {/* Mobile AI Drawer */}
      {showMobileAI && (
        <div className="lg:hidden fixed inset-0 z-[60] flex justify-end"
          style={{ background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowMobileAI(false); }}>
          <div className="w-[88vw] max-w-sm h-full flex flex-col relative"
            style={{ background:'var(--bg-panel)', borderLeft:'1px solid rgba(124,58,237,0.2)' }}>
            <button onClick={() => setShowMobileAI(false)}
              className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.06)', color:'var(--text-secondary)' }}>
              <X size={16} />
            </button>
            <AIPanel crowdData={crowdData} queues={queues} mobileMode />
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
        style={{ background:'rgba(13,18,32,0.97)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(124,58,237,0.15)' }}>
        {[
          { view:'dashboard', icon:<LayoutDashboard size={22}/>, label:'Dashboard' },
          { view:'map',       icon:<Map size={22}/>,             label:'Map'       },
          { view:'alerts',    icon:<Bell size={22}/>,            label:'Alerts'    },
          { view:'chat',      icon:<MessageSquare size={22}/>,   label:'Chat'      },
        ].map(item => (
          <button key={item.view} onClick={() => { setActiveView(item.view); setShowMobileAI(false); }}
            className="flex flex-col items-center gap-1 transition-all"
            style={{ color: activeView === item.view && !showMobileAI ? '#A78BFA' : 'var(--text-muted)' }}>
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
        <button onClick={() => setShowMobileAI(p => !p)}
          className="flex flex-col items-center gap-1"
          style={{ color: showMobileAI ? '#A78BFA' : 'var(--text-muted)' }}>
          <Sparkles size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wide">AI</span>
        </button>
      </nav>
    </div>
  );
}
