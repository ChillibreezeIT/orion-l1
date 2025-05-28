import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId } = await req.json();

    if (!message || !sessionId || !userId) {
      return NextResponse.json({ error: 'Missing required data.' }, { status: 400 });
    }

    // Get AI reply from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '⚠️ No response from AI.';
    console.log('✅ OpenAI Reply:', reply);

    // Supabase config from environment
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    };

    // Save user message
    await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { session_id: sessionId, role: 'user', content: message }
      ])
    });

    // Save AI reply
    await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { session_id: sessionId, role: 'assistant', content: reply }
      ])
    });

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
