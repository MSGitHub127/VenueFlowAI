'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Navigation } from 'lucide-react';

interface RoomData { id: string; name: string; capacity: number; }
interface FloorMapViewProps { crowdData: RoomData[]; }

const getRoomFill   = (c: number) => c < 40 ? 'rgba(16,185,129,0.2)' : c < 75 ? 'rgba(245,158,11,0.28)' : 'rgba(239,68,68,0.42)';
const getRoomStroke = (c: number) => c < 40 ? 'rgba(16,185,129,0.75)' : c < 75 ? 'rgba(245,158,11,0.9)' : 'rgba(239,68,68,1)';
const getTextColor  = (c: number) => c < 40 ? '#34D399' : c < 75 ? '#FCD34D' : '#F87171';
const getStatusLabel = (c: number) => c < 40 ? 'Clear' : c < 75 ? 'Busy' : 'Crowded';

const ROOMS = [
  { id: 'atrium', d: 'M 300 100 L 500 100 L 500 300 L 300 300 Z',    cx: 400, cy: 200, label: 'Main Atrium'      },
  { id: 'vip',    d: 'M 100 100 L 280 100 L 280 200 L 100 200 Z',    cx: 190, cy: 150, label: 'VIP Lounge'       },
  { id: 'north',  d: 'M 320 20  L 480 20  L 480 80  L 320 80  Z',    cx: 400, cy: 50,  label: 'North Hall'       },
  { id: 'south',  d: 'M 520 150 L 750 150 L 750 250 L 520 250 Z',    cx: 635, cy: 200, label: 'South Concourse'  },
  { id: 'food',   d: 'M 150 250 L 450 250 L 450 350 L 150 350 Z',    cx: 300, cy: 300, label: 'Food Court'       },
  { id: 'merch',  d: 'M 520 270 L 750 270 L 750 350 L 520 350 Z',    cx: 635, cy: 310, label: 'Merch Store'      },
  { id: 'exit',   d: 'M 20  20  L 200 20  L 200 80  L 20  80  Z',    cx: 110, cy: 50,  label: 'Exit Gate A'      },
  { id: 'exitB',  d: 'M 600 355 L 780 355 L 780 395 L 600 395 Z',    cx: 690, cy: 375, label: 'Exit Gate B'      },
];

export default function FloorMapView({ crowdData }: FloorMapViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [layer, setLayer] = useState<'capacity' | 'exits'>('capacity');

  const getRoom = (id: string) => crowdData.find(r => r.id === id);
  const sorted  = [...crowdData].sort((a, b) => b.capacity - a.capacity);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Navigation size={16} style={{ color: '#A78BFA' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Navigation</span>
        </div>
        <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Floor Map</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Live capacity heatmap · Tap a zone for details · Drag to pan, scroll to zoom
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map */}
        <div className="lg:col-span-2">
          {/* Layer toggle */}
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} style={{ color: 'var(--text-muted)' }} />
            {(['capacity', 'exits'] as const).map(l => (
              <button key={l} onClick={() => setLayer(l)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize"
                style={{
                  background: layer === l ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                  color:      layer === l ? '#A78BFA' : 'var(--text-muted)',
                  border:     layer === l ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                {l === 'capacity' ? 'Capacity Heatmap' : 'Exit Routes'}
              </button>
            ))}
          </div>

          <div className="relative rounded-2xl overflow-hidden" style={{ height: 460, background: '#0B0F19', border: '1px solid rgba(124,58,237,0.18)' }}>
            <TransformWrapper initialScale={1.3} minScale={0.6} maxScale={5} centerOnInit>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Grid bg */}
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(rgba(124,58,237,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                      {/* Floor plan ghost */}
                      <div className="absolute inset-0 bg-cover bg-center pointer-events-none"
                        style={{ backgroundImage: "url('/floor_plan.png')", opacity: 0.1, mixBlendMode: 'screen' }} />

                      <svg viewBox="0 0 800 400" className="w-full h-full">
                        {/* Flow paths */}
                        <g stroke={layer === 'exits' ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.35)'}
                           strokeWidth="2" strokeDasharray="8,8" fill="none">
                          {["M 400 200 L 190 150","M 400 200 L 400 50","M 400 200 L 635 200",
                            "M 400 200 L 300 300","M 300 300 L 635 310","M 635 310 L 690 375",
                            "M 110 50 L 400 200","M 690 375 L 400 200"].map((d, i) => (
                            <motion.path key={i} d={d}
                              animate={{ strokeDashoffset: [0, -80] }}
                              transition={{ repeat: Infinity, duration: 3 + i * 0.2, ease: 'linear' }} />
                          ))}
                        </g>

                        {ROOMS.map(room => {
                          const data = getRoom(room.id);
                          const cap  = data?.capacity ?? 0;
                          const isSelected = selectedRoom === room.id;
                          return (
                            <g key={room.id} className="cursor-pointer"
                              onClick={() => setSelectedRoom(isSelected ? null : room.id)}>
                              <motion.path d={room.d}
                                animate={{ fill: getRoomFill(cap), stroke: isSelected ? '#A78BFA' : getRoomStroke(cap) }}
                                strokeWidth={isSelected ? 2.5 : 1.5}
                                transition={{ duration: 1 }} />
                              <text x={room.cx} y={room.cy - 10} textAnchor="middle"
                                fill="#94A3B8" fontSize="8.5" fontWeight="700"
                                className="uppercase tracking-widest pointer-events-none">{room.label}</text>
                              <motion.text x={room.cx} y={room.cy + 12} textAnchor="middle"
                                fontSize="20" fontWeight="900" className="pointer-events-none"
                                animate={{ fill: getTextColor(cap) }} transition={{ duration: 0.8 }}>{cap}%</motion.text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </TransformComponent>

                  {/* Zoom controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                    {[
                      { icon: <ZoomIn size={15} />, fn: zoomIn,        tip: 'Zoom in'  },
                      { icon: <ZoomOut size={15}/>, fn: zoomOut,       tip: 'Zoom out' },
                      { icon: <RotateCcw size={14}/>, fn: resetTransform, tip: 'Reset' },
                    ].map((b, i) => (
                      <button key={i} onClick={() => b.fn()} title={b.tip}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(13,18,32,0.9)', color: '#94A3B8', border: '1px solid rgba(124,58,237,0.2)', backdropFilter: 'blur(8px)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#A78BFA'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.2)'; }}>
                        {b.icon}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {[['#10B981','Clear'],['#F59E0B','Busy'],['#EF4444','Crowded']].map(([c, l]) => (
                      <span key={l} className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: c }} />{l}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>

          {/* Selected room detail */}
          {selectedRoom && (() => {
            const room = ROOMS.find(r => r.id === selectedRoom)!;
            const data = getRoom(selectedRoom);
            const cap  = data?.capacity ?? 0;
            return (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl flex items-center justify-between"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{room.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Status: <span style={{ color: getTextColor(cap), fontWeight: 600 }}>{getStatusLabel(cap)}</span>
                    {' · '} Capacity: <span style={{ color: getTextColor(cap), fontWeight: 700 }}>{cap}%</span>
                  </p>
                </div>
                <button onClick={() => setSelectedRoom(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Deselect
                </button>
              </motion.div>
            );
          })()}
        </div>

        {/* Zone list sidebar */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>All Zones (ranked)</p>
          {sorted.map((room, i) => (
            <motion.button key={room.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedRoom(prev => prev === room.id ? null : room.id)}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                background:  selectedRoom === room.id ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                border:      selectedRoom === room.id ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(124,58,237,0.1)',
              }}
              onMouseEnter={e => { if (selectedRoom !== room.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.25)'; }}
              onMouseLeave={e => { if (selectedRoom !== room.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.1)'; }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{room.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${getTextColor(room.capacity)}18`, color: getTextColor(room.capacity), border: `1px solid ${getTextColor(room.capacity)}40` }}>
                  {getStatusLabel(room.capacity)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: getRoomStroke(room.capacity) }}
                  initial={{ width: 0 }} animate={{ width: `${room.capacity}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }} />
              </div>
              <p className="text-[11px] mt-1.5 text-right font-bold" style={{ color: getTextColor(room.capacity) }}>{room.capacity}%</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
