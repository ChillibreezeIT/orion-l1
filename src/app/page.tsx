'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FiSend, FiTrash2, FiArrowDown, FiMessageSquare, FiImage, FiCode, FiGlobe, FiSearch, FiHelpCircle, FiPlus, FiFileText, FiBarChart2, FiLink, FiUser } from 'react-icons/fi';

const starterPrompts = [
  {
    icon: <FiFileText className="w-6 h-6 text-pink-400" />,
    label: 'Help me write',
    value: 'Can you help me write a professional email to my boss about requesting time off?'
  },
  {
    icon: <FiImage className="w-6 h-6 text-purple-400" />,
    label: 'Create images',
    value: 'Create an image of a futuristic city skyline at sunset.'
  },
  {
    icon: <FiCode className="w-6 h-6 text-blue-400" />,
    label: 'Code',
    value: 'Write a Python function to reverse a string.'
  },
  {
    icon: <FiGlobe className="w-6 h-6 text-green-400" />,
    label: 'Analyze image',
    value: 'Analyze the content of this image.'
  },
  {
    icon: <FiLink className="w-6 h-6 text-indigo-400" />,
    label: 'Summarize link',
    value: 'Summarize the main points of this article: [paste link here]'
  },
  {
    icon: <FiHelpCircle className="w-6 h-6 text-purple-300" />,
    label: 'Get advice',
    value: 'What advice do you have for improving productivity while working from home?'
  },
  {
    icon: <FiFileText className="w-6 h-6 text-red-400" />,
    label: 'Process doc',
    value: 'Extract the key information from this document.'
  },
  {
    icon: <FiBarChart2 className="w-6 h-6 text-orange-400" />,
    label: 'Analyze data',
    value: 'Analyze this dataset and provide insights.'
  },
  {
    icon: <FiMessageSquare className="w-6 h-6 text-pink-400" />,
    label: 'Brainstorm',
    value: 'Brainstorm ideas for a new mobile app.'
  },
  {
    icon: <FiSearch className="w-6 h-6 text-pink-400" />,
    label: 'Web search',
    value: 'Search the web for the latest news on AI advancements.'
  },
];

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4o');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

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
            content: `![Generated Image](${data.imageUrl})`,
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#181c20] to-[#23272f]">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between bg-gradient-to-b from-[#23272f] to-[#181c20] border-r border-gray-800 p-6 text-gray-200">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">🌐</span>
            <span className="font-bold text-lg tracking-wide">Orion L1</span>
          </div>
          <button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-6 transition">
            <FiPlus /> Start New
          </button>
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">Tools</div>
            <nav className="flex flex-col gap-1">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white font-medium">
                <FiMessageSquare /> AI Chat
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
                <FiImage /> Image Generation
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
                <FiSearch /> AI Search Engine
              </button>
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FiUser /> Hi
        </div>
      </aside>

      {/* Main Chat Pane */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white"
            >
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="dall-e-3">DALL·E 3</option>
            </select>
          </div>
          {messages.length === 0 && !loading && (
            <>
              <h1 className="text-3xl font-semibold text-center mb-6 text-gray-100">How can I help you today?</h1>
              <div className="w-full flex items-center bg-gray-900 border border-gray-800 rounded-full px-4 py-3 mb-8 shadow-lg">
                <span className="text-gray-400 mr-2"><FiPlus /></span>
                <input
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  maxLength={2000}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {starterPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-2xl p-5 shadow-md transition group relative"
                    onClick={() => setInput(prompt.value)}
                  >
                    <div className="mb-2 group-hover:scale-110 transition-transform">
                      {prompt.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-100 mt-1">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Chat messages and input for active chat */}
          {messages.length > 0 && (
            <>
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="w-full max-w-2xl flex-1 overflow-y-auto space-y-4 mb-6 scroll-smooth bg-gray-900/70 rounded-xl p-4 backdrop-blur-sm shadow-lg"
                style={{ minHeight: 400 }}
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`prose prose-invert max-w-2xl text-sm px-4 py-3 rounded-lg shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-300 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
                      AI is thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {/* Scroll to bottom button */}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-24 right-8 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition hover:scale-110"
                >
                  <FiArrowDown className="w-5 h-5" />
                </button>
              )}
              <div className="w-full flex items-center bg-gray-900 border border-gray-800 rounded-full px-4 py-3 mt-4 shadow-lg">
                <span className="text-gray-400 mr-2"><FiPlus /></span>
                <input
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  maxLength={2000}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="ml-2 text-gray-400 hover:text-white transition flex items-center gap-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
