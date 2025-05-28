'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4o');

  const starterPrompts = [
    "Explain quantum computing in simple terms",
    "Give me ideas for a 3-day trip to Japan",
    "What's the difference between GPT-4o and GPT-4 Turbo?",
  ];

  const sendMessage = async (customMessage?: string) => {
    const userMessage = (customMessage ?? input).trim();
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
          {
            role: 'assistant',
            content: `<img src="${data.imageUrl}" alt="Generated Image" class="rounded-lg mt-2"/>`,
          },
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
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Orion L1 <span className="text-blue-400">[GPT]</span></h1>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-sm rounded px-3 py-2"
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="dall-e-3">DALL·E 3</option>
        </select>
      </div>

      {/* Message Window */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-3 max-w-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-300 rounded-lg px-4 py-3 text-sm">
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Starter Prompts */}
      {messages.length === 0 && !loading && (
        <div className="w-full max-w-4xl grid sm:grid-cols-3 gap-4 mb-6">
          {starterPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="bg-gray-800 hover:bg-gray-700 text-left px-4 py-3 rounded-lg border border-gray-700 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="w-full max-w-4xl flex items-center gap-2 mt-auto">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? '...' : '➤'}
        </button>
      </div>
    </main>
  );
}
