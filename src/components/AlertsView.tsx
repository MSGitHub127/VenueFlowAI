'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, X, Filter, BellOff } from 'lucide-react';

interface RoomData  { id: string; name: string; capacity: number; }
interface QueueData { id: string; name: string; waitTime: number; status: string; }
interface AlertsViewProps { crowdData: RoomData[]; queues: QueueData[]; }

type AlertLevel = 'critical' | 'warning' | 'info' | 'resolved';

interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  body: string;
  time: string;
  zone: string;
  dismissed: boolean;
}

const levelConfig: Record<AlertLevel, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  critical: { color: '#F87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: <AlertTriangle size={15} />, label: 'Critical' },
  warning:  { color: '#FCD34D', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: <Bell size={15} />,          label: 'Warning'  },
  info:     { color: '#67E8F9', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',   icon: <Info size={15} />,          label: 'Info'     },
  resolved: { color: '#34D399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  icon: <CheckCircle size={15} />,   label: 'Resolved' },
};

function buildAlerts(crowdData: RoomData[], queues: QueueData[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const t = (offset: number) => new Date(now.getTime() - offset * 60000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  crowdData.forEach(room => {
    if (room.capacity >= 90) {
      alerts.push({ id: `cap-${room.id}`, level: 'critical', dismissed: false, zone: room.name,
        title: `${room.name} at critical capacity`, body: `${room.capacity}% full — immediate rerouting recommended. Avoid this zone and direct attendees to adjacent areas.`, time: t(1) });
    } else if (room.capacity >= 75) {
      alerts.push({ id: `warn-${room.id}`, level: 'warning', dismissed: false, zone: room.name,
        title: `${room.name} filling up fast`, body: `${room.capacity}% capacity reached. Consider alternative routes through South Concourse or North Hall.`, time: t(3) });
    }
  });

  queues.forEach(q => {
    if (q.waitTime >= 15) {
      alerts.push({ id: `queue-${q.id}`, level: 'warning', dismissed: false, zone: q.name,
        title: `Long queue at ${q.name}`, body: `Current wait: ${q.waitTime} min. Attendees are advised to visit during halftime or use nearby alternatives.`, time: t(5) });
    }
  });

  // Static informational alerts
  alerts.push(
    { id: 'info-1', level: 'info', dismissed: false, zone: 'Exit Gate B',
      title: 'Exit Gate B fully operational', body: 'All exit lanes open. Estimated walk-out time from main atrium is under 8 minutes via the south corridor.', time: t(8) },
    { id: 'info-2', level: 'info', dismissed: false, zone: 'North Hall',
      title: 'VIP shuttle service active', body: 'Complimentary shuttle running every 15 minutes from North Hall entrance to parking zones P1–P4.', time: t(12) },
    { id: 'res-1', level: 'resolved', dismissed: false, zone: 'Food Court',
      title: 'Food Court overcrowding resolved', body: 'Crowd levels have returned to normal after additional staff were deployed. Wait times are now under 6 min.', time: t(20) },
  );

  return alerts.sort((a, b) => {
    const order: AlertLevel[] = ['critical', 'warning', 'info', 'resolved'];
    return order.indexOf(a.level) - order.indexOf(b.level);
  });
}

export default function AlertsView({ crowdData, queues }: AlertsViewProps) {
  const [filter, setFilter]      = useState<AlertLevel | 'all'>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const allAlerts  = buildAlerts(crowdData, queues);
  const visible    = allAlerts.filter(a => !dismissed.has(a.id) && (filter === 'all' || a.level === filter));
  const critCount  = allAlerts.filter(a => a.level === 'critical' && !dismissed.has(a.id)).length;
  const warnCount  = allAlerts.filter(a => a.level === 'warning'  && !dismissed.has(a.id)).length;

  const dismiss    = (id: string) => setDismissed(prev => new Set([...prev, id]));
  const dismissAll = () => setDismissed(new Set(allAlerts.map(a => a.id)));

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={16} style={{ color: '#A78BFA' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Notifications</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Alerts
              {critCount > 0 && (
                <span className="ml-3 text-base font-bold px-2.5 py-0.5 rounded-full align-middle"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {critCount} critical
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Live venue notifications — auto-updating every 5 seconds
            </p>
          </div>
          {visible.length > 0 && (
            <button onClick={dismissAll}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all mt-1"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
              <BellOff size={13} /> Dismiss all
            </button>
          )}
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {([
          { key: 'all',      label: 'Total',    count: allAlerts.filter(a => !dismissed.has(a.id)).length, color: '#A78BFA', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
          { key: 'critical', label: 'Critical', count: critCount, color: '#F87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
          { key: 'warning',  label: 'Warnings', count: warnCount, color: '#FCD34D', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
          { key: 'info',     label: 'Info',     count: allAlerts.filter(a => a.level === 'info' && !dismissed.has(a.id)).length, color: '#67E8F9', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
        ] as const).map(s => (
          <button key={s.key} onClick={() => setFilter(s.key as AlertLevel | 'all')}
            className="rounded-2xl p-3 text-center transition-all"
            style={{
              background: filter === s.key ? s.bg : 'var(--bg-card)',
              border: filter === s.key ? `1px solid ${s.border}` : '1px solid rgba(124,58,237,0.1)',
              transform: filter === s.key ? 'scale(1.02)' : 'scale(1)',
            }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={13} style={{ color: 'var(--text-muted)' }} />
        {(['all', 'critical', 'warning', 'info', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider capitalize transition-all"
            style={{
              background: filter === f ? (f === 'all' ? 'rgba(124,58,237,0.2)' : `${levelConfig[f as AlertLevel]?.bg ?? 'rgba(124,58,237,0.2)'}`) : 'rgba(255,255,255,0.03)',
              color:      filter === f ? (f === 'all' ? '#A78BFA' : levelConfig[f as AlertLevel]?.color ?? '#A78BFA') : 'var(--text-muted)',
              border:     filter === f ? `1px solid ${f === 'all' ? 'rgba(124,58,237,0.35)' : levelConfig[f as AlertLevel]?.border ?? 'rgba(124,58,237,0.35)'}` : '1px solid rgba(255,255,255,0.05)',
            }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        <AnimatePresence>
          {visible.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.1)' }}>
              <CheckCircle size={36} style={{ color: '#34D399' }} className="mb-3" />
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>All clear!</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No active alerts for this filter.</p>
            </motion.div>
          ) : visible.map((alert, i) => {
            const cfg = levelConfig[alert.level];
            return (
              <motion.div key={alert.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
                className="relative p-5 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: `1px solid ${cfg.border}` }}>
                {/* Left accent */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" style={{ background: cfg.color }} />

                <div className="flex items-start justify-between gap-3 pl-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{alert.zone}</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>· {alert.time}</span>
                      </div>
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{alert.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{alert.body}</p>
                    </div>
                  </div>
                  <button onClick={() => dismiss(alert.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#F87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    aria-label="Dismiss alert">
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
