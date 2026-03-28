import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'Explain the core concept simply',
  'What are the key takeaways?',
  'Give me 3 action items',
];

// Renders inline bold: **text** → <strong>
function renderInline(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

// Full message renderer — handles numbered lists, bullets, bold, blank lines
function renderMessage(content) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines but add spacing
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Numbered list item: "1. ..." or "1) ..."
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      const [, num, rest] = numberedMatch;
      elements.push(
        <div key={i} className="flex gap-2.5 my-1">
          <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5"
            style={{ backgroundColor: '#c3ecd7', color: '#345949' }}>
            {num}
          </span>
          <span className="flex-1">{renderInline(rest)}</span>
        </div>
      );
      i++;
      continue;
    }

    // Bullet: "- ..." or "• ..."
    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-2 my-1">
          <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#426656' }} />
          <span className="flex-1">{renderInline(bulletMatch[1])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Normal paragraph line
    elements.push(
      <p key={i} className="my-0.5 leading-relaxed">{renderInline(trimmed)}</p>
    );
    i++;
  }

  return <div className="text-sm space-y-0.5">{elements}</div>;
}

function ChatBox({ summary }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I've read the video summary. Ask me anything — I can explain concepts, clarify points, or help you go deeper.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = text || input;
    if (!question.trim() || loading) return;
    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, summary, history: messages.slice(1) }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || '⚠️ Something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not reach the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 pb-2" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#c3ecd7' }}>
                <span className="text-[10px] font-bold" style={{ color: '#345949' }}>AI</span>
              </div>
            )}
            <div
              className="max-w-[85%] px-4 py-2.5"
              style={{
                borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                backgroundColor: msg.role === 'user' ? '#c3ecd7' : '#ffffff',
                color: msg.role === 'user' ? '#345949' : '#2c3437',
                boxShadow: '0 4px 12px rgba(44,52,55,0.06)',
                fontWeight: msg.role === 'user' ? 500 : 400,
              }}
            >
              {/* User messages render as plain text, AI messages get full markdown */}
              {msg.role === 'user'
                ? <p className="text-sm leading-relaxed">{msg.content}</p>
                : renderMessage(msg.content)
              }
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#c3ecd7' }}>
              <span className="text-[10px] font-bold" style={{ color: '#345949' }}>AI</span>
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(44,52,55,0.06)' }}>
              <div className="flex space-x-1 items-center h-3">
                {[0, 150, 300].map(delay => (
                  <div key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#acb3b7', animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 py-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 text-xs transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: '#ffffff', color: '#596064', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(44,52,55,0.06)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 pt-2">
        <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: '#ffffff', borderRadius: '9999px', boxShadow: '0 4px 16px rgba(44,52,55,0.06)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a follow-up..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: '#2c3437' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-7 h-7 flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: input.trim() && !loading ? '#426656' : '#dce4e8', borderRadius: '9999px' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;