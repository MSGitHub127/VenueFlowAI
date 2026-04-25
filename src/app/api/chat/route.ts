import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import xss from 'xss';

interface RoomData  { id: string; name: string; capacity: number; }
interface QueueData { id: string; name: string; waitTime: number; status: string; }

const rateLimitMap = new Map<string, number>();

const chatSchema = z.object({
  message:   z.string().min(1).max(1000),
  crowdData: z.array(z.any()),
  queues:    z.array(z.any()),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    if ((rateLimitMap.get(ip) ?? 0) > now - 2000) {
      return NextResponse.json({ reply: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    rateLimitMap.set(ip, now);

    const body = await req.json();
    const result = chatSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ reply: 'Invalid payload.' }, { status: 400 });

    const message   = xss(result.data.message);
    const rooms     = result.data.crowdData as RoomData[];
    const queueList = result.data.queues   as QueueData[];

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: `⚠️ GEMINI_API_KEY missing — add it to .env.local. Mock tip: avoid ${rooms[0]?.name ?? 'Main Atrium'} right now, it's the most congested zone.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const sysPrompt = `You are VenueFlowAI, the smart venue assistant helping attendees navigate a live event.

LIVE FLOOR CONGESTION:
${rooms.map(r => `- ${r.name}: ${r.capacity}% full`).join('\n')}

LIVE QUEUE WAIT TIMES:
${queueList.map(q => `- ${q.name}: ${q.waitTime} min wait (${q.status})`).join('\n')}

INSTRUCTIONS:
- Answer based on this LIVE data only. Be concise (1-2 sentences max).
- People are reading on their phones while walking. Recommend the quietest options.
- Be friendly and confident.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: { systemInstruction: sysPrompt, temperature: 0.7 },
    });

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({ reply: "AI is temporarily unavailable. Try again shortly." }, { status: 500 });
  }
}
