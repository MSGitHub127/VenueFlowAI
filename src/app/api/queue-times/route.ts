import { NextResponse } from 'next/server';

export async function GET() {
  const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const status = (w: number): 'LOW' | 'MEDIUM' | 'HIGH' => w <= 6 ? 'LOW' : w <= 14 ? 'MEDIUM' : 'HIGH';

  const queues = [
    { id: '1', name: 'Burger Hub',          location: 'SOUTH CONCOURSE', type: 'dining',      waitTime: r(2, 6),  description: 'Shortest food wait in your zone.', actionText: 'Route Me' },
    { id: '2', name: 'Section 102 Washrooms', location: 'LEVEL 1 EAST',  type: 'restroom',    waitTime: r(12, 25), description: 'High traffic from nearby section.', actionText: 'Find Nearby' },
    { id: '3', name: 'Artisan Pizza',        location: 'NORTH GATE',     type: 'dining',      waitTime: r(1, 5),  description: 'Quick bite before second half.', actionText: 'Order Now' },
    { id: '4', name: 'The Sky Bar',          location: 'PREMIUM LEVEL 2', type: 'bar',        waitTime: r(8, 18), description: 'Great views, moderate wait.', actionText: 'Book Table' },
    { id: '5', name: 'Fan Merch Store',      location: 'MAIN ENTRANCE',  type: 'merchandise', waitTime: r(10, 22), description: 'Busy — consider visiting at halftime.', actionText: 'Check Stock' },
  ].map(q => ({ ...q, status: status(q.waitTime) }));

  return NextResponse.json(queues);
}
