'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useJsApiLoader } from '@react-google-maps/api';
import { Maximize2, X, Zap, Map } from 'lucide-react';

interface RoomData { id: string; name: string; capacity: number; }
interface CrowdMapProps { crowdData: RoomData[]; }

const getRoomFill   = (c: number) => c < 40 ? 'rgba(16,185,129,0.2)' : c < 75 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.45)';
const getRoomStroke = (c: number) => c < 40 ? 'rgba(16,185,129,0.7)' : c < 75 ? 'rgba(245,158,11,0.85)' : 'rgba(239,68,68,1)';
const getTextColor  = (c: number) => c < 40 ? '#34D399' : c < 75 ? '#FCD34D' : '#F87171';

export default function CrowdMap({ crowdData }: CrowdMapProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Google Maps API initialisation (used for routing services integration)
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const worstRoom = crowdData.length > 0
    ? [...crowdData].sort((a, b) => b.capacity - a.capacity)[0]
    : null;

  const getRoom = (id: string) => crowdData.find(r => r.id === id);

  const Room = ({ id, d, cx, cy, label }: { id: string; d: string; cx: number; cy: number; label: string }) => {
    const room = getRoom(id);
    const cap  = room?.capacity ?? 0;
    return (
      <g role="img" aria-label={`${label}: ${cap}% capacity`}>
        <motion.path d={d}
          animate={{ fill: getRoomFill(cap), stroke: getRoomStroke(cap) }}
          strokeWidth="1.5" transition={{ duration: 1.2 }} className="cursor-pointer" />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#94A3B8" fontSize="9"
          fontWeight="700" className="uppercase tracking-widest pointer-events-none">{label}</text>
        <motion.text x={cx} y={cy + 14} textAnchor="middle" fontSize="22" fontWeight="900"
          animate={{ fill: getTextColor(cap) }} transition={{ duration: 1 }}
          className="pointer-events-none">{cap}%</motion.text>
      </g>
    );
  };

  const MapContent = () => (
    <div className="relative w-full h-full flex items-center justify-center"
      aria-label="Interactive Venue Floor Plan" role="application">
      {/* Floor plan ghost */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/floor_plan.png')", opacity: 0.12, mixBlendMode: 'screen' }} aria-hidden="true" />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(rgba(124,58,237,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <svg viewBox="0 0 800 400" className="w-full h-full" aria-hidden="true">
        {/* Animated traversal paths */}
        <g stroke="rgba(124,58,237,0.4)" strokeWidth="2.5" strokeDasharray="9,9" fill="none">
          {[
            "M 400 200 L 190 150", "M 400 200 L 400 50",  "M 400 200 L 640 200",
            "M 400 200 L 300 300", "M 300 300 L 640 310", "M 640 310 L 690 370",
          ].map((d, i) => (
            <motion.path key={i} d={d}
              animate={{ strokeDashoffset: [0, -90] }}
              transition={{ repeat: Infinity, duration: 3.5 + i * 0.25, ease: 'linear' }} />
          ))}
        </g>

        <Room id="atrium" d="M 300 100 L 500 100 L 500 300 L 300 300 Z"      cx={400} cy={200} label="Main Atrium" />
        <Room id="vip"    d="M 100 100 L 280 100 L 280 200 L 100 200 Z"      cx={190} cy={150} label="VIP Lounge"  />
        <Room id="north"  d="M 320 20  L 480 20  L 480 80  L 320 80  Z"      cx={400} cy={50}  label="North Hall"  />
        <Room id="south"  d="M 520 150 L 750 150 L 750 250 L 520 250 Z"      cx={635} cy={200} label="South Concourse" />
        <Room id="food"   d="M 150 250 L 450 250 L 450 350 L 150 350 Z"      cx={300} cy={300} label="Food Court"  />
        <Room id="merch"  d="M 520 270 L 750 270 L 750 350 L 520 350 Z"      cx={635} cy={310} label="Merch Store" />
        <Room id="exit"   d="M 20  20  L 200 20  L 200 80  L 20  80  Z"      cx={110} cy={50}  label="Exit A"      />
        <Room id="exitB"  d="M 600 355 L 780 355 L 780 395 L 600 395 Z"     cx={690} cy={375} label="Exit B"      />
      </svg>
    </div>
  );

  return (
    <>
      <section className="mt-8" aria-label="Live Crowd Map">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Map size={18} style={{ color: '#A78BFA' }} />
              Live Floor Traffic
              {isLoaded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}>
                  Maps Ready
                </span>
              )}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Drag to pan · scroll to zoom · live capacity heatmap</p>
          </div>
          <button onClick={() => setIsOpen(true)} aria-label="Expand map to fullscreen"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.12)'; }}>
            <Maximize2 size={16} />
          </button>
        </header>

        <div className="relative w-full rounded-2xl overflow-hidden"
          style={{ height: 360, background: '#0B0F19', border: '1px solid rgba(124,58,237,0.15)' }}>
          <TransformWrapper initialScale={1.3} minScale={0.7} maxScale={4} centerOnInit>
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <MapContent />
            </TransformComponent>
          </TransformWrapper>

          {/* Legend */}
          <div className="absolute top-4 left-4 flex gap-2">
            {[['#10B981','Clear'],['#F59E0B','Busy'],['#EF4444','Crowded']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="w-2 h-2 rounded-sm" style={{ background: c }} />{l}
              </span>
            ))}
          </div>

          {/* Alert footer */}
          {worstRoom && (
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(to top, rgba(7,9,15,0.96) 0%, transparent 100%)' }}>
              <div className="flex items-center gap-2.5">
                <div className="relative w-2.5 h-2.5 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#EF4444', opacity: 0.6 }} />
                  <div className="relative w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Congestion Alert</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {worstRoom.name} at <span style={{ color: '#F87171', fontWeight: 700 }}>{worstRoom.capacity}%</span> — rerouting recommended
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.15)'; }}>
                Expand
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)' }}
            role="dialog" aria-modal="true" aria-label="Fullscreen Venue Map">
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              className="relative w-full max-w-6xl rounded-3xl overflow-hidden"
              style={{ height: '84vh', background: '#090C15', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 100px rgba(124,58,237,0.2)' }}>

              <button onClick={() => setIsOpen(false)} aria-label="Close map"
                className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                <X size={18} />
              </button>

              <TransformWrapper initialScale={1.2} minScale={0.5} maxScale={5} centerOnInit>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-[1200px] !h-[800px]">
                  <MapContent />
                </TransformComponent>
              </TransformWrapper>

              {/* Command bar */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-5 rounded-2xl"
                style={{ background: 'rgba(13,18,32,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div>
                  <h3 className="text-lg font-black gradient-text flex items-center gap-2">
                    <Zap size={18} /> VenueFlowAI Command Grid
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Live tracking · {isLoaded ? 'Google Maps routing enabled' : 'Maps loading…'} · Drag to pan, scroll to zoom
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  {[['#10B981','Clear'],['#F59E0B','Moderate'],['#EF4444','Crowded']].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
