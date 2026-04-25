import { NextResponse } from 'next/server';

export async function GET() {
  const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const rooms = [
    { id: 'atrium', name: 'Main Atrium',      capacity: r(20, 55)  },
    { id: 'vip',    name: 'VIP Lounge',       capacity: r(30, 90)  },
    { id: 'north',  name: 'North Hall',       capacity: r(15, 95)  },
    { id: 'south',  name: 'South Concourse',  capacity: r(10, 40)  },
    { id: 'food',   name: 'Food Court',       capacity: r(55, 99)  },
    { id: 'merch',  name: 'Merch Store',      capacity: r(10, 50)  },
    { id: 'exit',   name: 'Exit Gate A',      capacity: r(30, 70)  },
    { id: 'exitB',  name: 'Exit Gate B',      capacity: r(5, 25)   },
  ];

  return NextResponse.json(rooms);
}
