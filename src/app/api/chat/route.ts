import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId } = await req.json();

    // Validate required inputs
    if (!message || !sessionId || !userId) {
      return NextResponse.json({ error: 'Missing required data.' }, { status: 400 });
    }

    // Call OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '⚠️ No response from AI.';

    console.log('✅ OpenAI Reply:', reply);

    // Save both user and assistant messages to Supabase via Prisma
    await prisma.message.createMany({
      data: [
        { sessionId, role: 'user', content: message },
        { sessionId, role: 'assistant', content: reply },
      ],
    });

    // Return the AI reply
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
