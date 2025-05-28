'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        sessionId: 1,
        userId: 1
      }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">💬 Orion L1 Chat</h1>
      <div className="space-y-2 max-w-xl mx-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-md ${msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 max-w-xl mx-auto">
        <input
          className="flex-1 border px-4 py-2 rounded-md"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Send
        </button>
      </div>
    </main>
  );
}
