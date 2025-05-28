'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4o'); // default model

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      if (model === 'dall-e-3') {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage }),
        });
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `<img src="${data.imageUrl}" alt="Generated Image" class="rounded-lg"/>` }
        ]);
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            sessionId: 1,
            userId: 1,
            model,
          }),
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: Unable to generate response.' }]);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 text-center">💬 Orion L1 Chat</h1>

        <div className="flex justify-end mb-4">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-black dark:text-white rounded-lg px-3 py-2"
          >
            <option value="gpt-4o">GPT-4o (Fast & Multimodal)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="dall-e-3">DALL·E 3 (Image)</option>
          </select>
        </div>

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-xl px-4 py-3 max-w-[75%] text-sm shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm max-w-[75%] text-gray-500 italic">
                AI is thinking...
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </main>
  );
}
