'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, CheckCircle, ChevronRight, Clock, Star, Trash2, Zap } from 'lucide-react';

interface MenuItem {
  id: string; name: string; price: number; description: string;
  emoji: string; category: string; popular?: boolean; waitMins: number;
}

const MENU: MenuItem[] = [
  { id: 'm1',  name: 'Signature Burger',   price: 350, emoji: '🍔', category: 'Mains',   popular: true, waitMins: 8,  description: 'Double smash patty, cheddar, house sauce, brioche bun' },
  { id: 'm2',  name: 'BBQ Loaded Fries',   price: 250, emoji: '🍟', category: 'Sides',   popular: true, waitMins: 5,  description: 'Crispy fries, pulled pork, BBQ drizzle, pickled jalapeños' },
  { id: 'm3',  name: 'Margherita Pizza',   price: 450, emoji: '🍕', category: 'Mains',   waitMins: 12, description: 'San Marzano tomato, fresh mozzarella, basil, EVOO' },
  { id: 'm4',  name: 'Spicy Chicken Wrap', price: 250, emoji: '🌯', category: 'Mains',   waitMins: 7,  description: 'Crispy chicken, sriracha slaw, avocado, flour tortilla' },
  { id: 'm5',  name: 'Craft Lager',        price: 400, emoji: '🍺', category: 'Drinks',  popular: true, waitMins: 2,  description: 'Local microbrewery pale lager — ice cold, 330ml' },
  { id: 'm6',  name: 'Soft Drink',         price: 100, emoji: '🥤', category: 'Drinks',  waitMins: 1,  description: 'Cola, lemonade, or sparkling water — choice of size' },
  { id: 'm7',  name: 'Nachos Grande',      price: 300, emoji: '🧀', category: 'Snacks',  waitMins: 6,  description: 'Tortilla chips, nacho cheese, salsa, sour cream, guac' },
  { id: 'm8',  name: 'Hot Dog Classic',    price: 200, emoji: '🌭', category: 'Snacks',  waitMins: 4,  description: 'All-beef frank, mustard, ketchup, caramelised onions' },
  { id: 'm9',  name: 'Churros & Dip',      price: 250, emoji: '🍩', category: 'Desserts', waitMins: 5, description: 'Cinnamon churros, chocolate dipping sauce, whipped cream' },
];

const CATEGORIES = ['All', ...Array.from(new Set(MENU.map(m => m.category)))];

type CartItem = MenuItem & { qty: number };
type Step = 'menu' | 'seat' | 'confirm' | 'placed';

export default function OrderToSeat() {
  const [cat, setCat]         = useState('All');
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [seat, setSeat]       = useState('');
  const [step, setStep]       = useState<Step>('menu');
  const [showCart, setShowCart] = useState(false);

  const filtered = MENU.filter(m => cat === 'All' || m.category === cat);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const maxWait    = cart.length ? Math.max(...cart.map(i => i.waitMins)) + 2 : 0;

  const addItem = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      return ex ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...item, qty: 1 }];
    });
  };
  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty  = (id: string, delta: number) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
  );
  const getQty = (id: string) => cart.find(i => i.id === id)?.qty ?? 0;

  if (step === 'placed') {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
          <CheckCircle size={40} style={{ color: '#10B981' }} />
        </motion.div>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Order Placed!</h2>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          Delivering to <span className="font-bold" style={{ color: '#A78BFA' }}>Seat {seat}</span>
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Estimated arrival: <span style={{ color: '#34D399', fontWeight: 700 }}>{maxWait}–{maxWait + 5} min</span>
        </p>
        <div className="mt-8 px-6 py-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Your order</p>
          {cart.map(i => (
            <div key={i.id} className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--text-secondary)' }}>{i.emoji} {i.name} ×{i.qty}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 pt-3 flex justify-between font-black" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}>
            <span>Total</span><span style={{ color: '#A78BFA' }}>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => { setCart([]); setSeat(''); setStep('menu'); }}
          className="mt-6 px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
          Place another order
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart size={16} style={{ color: '#A78BFA' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Food &amp; Drink</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Order to Seat</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Skip the queue — order and we deliver to your seat</p>
          </div>
          {totalItems > 0 && (
            <button onClick={() => setShowCart(p => !p)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: 'white', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
              <ShoppingCart size={16} />
              Cart
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#EF4444' }}>
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Steps indicator */}
      {step !== 'menu' && (
        <div className="flex items-center gap-2 mb-6">
          {(['menu','seat','confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                  style={{ background: step === s ? 'rgba(124,58,237,0.3)' : i < (['menu','seat','confirm'] as Step[]).indexOf(step) ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: step === s ? '#A78BFA' : i < (['menu','seat','confirm'] as Step[]).indexOf(step) ? '#34D399' : 'var(--text-muted)', border: step === s ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent' }}>
                  {i + 1}
                </div>
                <span className="text-xs font-semibold capitalize" style={{ color: step === s ? '#A78BFA' : 'var(--text-muted)' }}>{s === 'confirm' ? 'Review' : s === 'seat' ? 'Your Seat' : 'Menu'}</span>
              </div>
              {i < 2 && <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>
      )}

      {step === 'menu' && (
        <>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap flex-shrink-0 transition-all"
                style={{
                  background: cat === c ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : 'rgba(255,255,255,0.04)',
                  color:      cat === c ? 'white' : 'var(--text-muted)',
                  border:     cat === c ? '1px solid transparent' : '1px solid rgba(124,58,237,0.12)',
                  boxShadow:  cat === c ? '0 4px 15px rgba(124,58,237,0.3)' : 'none',
                }}>{c}</button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24 md:mb-8">
            {filtered.map((item, i) => {
              const qty = getQty(item.id);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative rounded-2xl p-4 transition-all"
                  style={{ background: 'var(--bg-card)', border: qty > 0 ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(124,58,237,0.1)' }}>
                  {item.popular && (
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <Star size={9} fill="currentColor" /> Popular
                    </span>
                  )}
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h3 className="font-black text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>~{item.waitMins} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black" style={{ color: '#A78BFA' }}>₹{item.price.toFixed(2)}</span>
                    {qty === 0 ? (
                      <button onClick={() => addItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.25)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.15)'; }}>
                        <Plus size={13} /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                          <Minus size={13} />
                        </button>
                        <span className="text-sm font-black" style={{ color: '#A78BFA', minWidth: 16, textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Sticky checkout bar */}
          {totalItems > 0 && (
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }}
              className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
              <button onClick={() => setStep('seat')}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-white shadow-2xl transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#4F46E5 100%)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
                <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                <span className="flex items-center gap-2">Checkout ₹{totalPrice.toFixed(2)} <ChevronRight size={18} /></span>
              </button>
            </motion.div>
          )}
        </>
      )}

      {step === 'seat' && (
        <div className="max-w-md">
          <div className="p-6 rounded-2xl mb-4" style={{ background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <h2 className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Where are you sitting?</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>We'll bring your order directly to your seat.</p>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Seat number</label>
            <input value={seat} onChange={e => setSeat(e.target.value)}
              placeholder="e.g. Block A, Row 5, Seat 12"
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(124,58,237,0.2)' }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={e =>  { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.2)'; }} />
            <div className="flex gap-2 mt-3">
              {['A5-12','B3-7','C1-22'].map(s => (
                <button key={s} onClick={() => setSeat(s)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: seat === s ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: seat === s ? '#A78BFA' : 'var(--text-muted)', border: seat === s ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.06)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('menu')}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
              Back
            </button>
            <button onClick={() => setStep('confirm')} disabled={!seat.trim()}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
              Review order
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="max-w-md">
          <div className="p-6 rounded-2xl mb-4" style={{ background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} style={{ color: '#A78BFA' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Delivering to Seat {seat}</span>
            </div>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>×{item.qty} · ₹{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F87171'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <div className="pt-4 flex justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Est. delivery</p>
                <p className="font-bold text-sm" style={{ color: '#34D399' }}>{maxWait}–{maxWait + 5} min</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                <p className="text-xl font-black" style={{ color: '#A78BFA' }}>₹{totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('seat')}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
              Back
            </button>
            <button onClick={() => setStep('placed')}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              Place order 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
