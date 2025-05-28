import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId = 1, userId = 1 } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message.' }, { status: 400 });
    }

    // Prepare Supabase API access
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    };

    // 1. Ensure user exists
    await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ id: userId, name: 'Guest' }])
    });

    // 2. Ensure session exists
    await fetch(`${supabaseUrl}/rest/v1/chat_sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ id: sessionId, user_id: userId }])
    });

    // 3. Get reply from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '⚠️ No response from AI.';
    console.log('✅ OpenAI Reply:', reply);

    // 4. Save user message
    await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { session_id: sessionId, role: 'user', content: message }
      ])
    });

    // 5. Save AI reply
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
