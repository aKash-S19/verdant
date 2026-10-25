import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Sprout, 
  User, 
  Droplets, 
  Calendar, 
  Compass, 
  RotateCcw,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useGarden } from '../context/GardenContext';
import { askGeminiChat } from '../lib/api';

export function AssistantPage() {
  const { profile } = useAuth();
  const { plants, tasks } = useGarden();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### 🌿 Hello ${profile?.full_name?.split(' ')[0] || 'fellow grower'}!\n\nI am your personal **Verdant AI Botanical Companion**.\n\nI have loaded your garden profile into memory:\n- **Environment:** ${profile?.garden_space || 'Balcony'} with ${profile?.sunlight_availability || 'partial sunlight'}\n- **Active Plants:** ${plants.map(p => p.custom_name).join(', ') || 'No plants added yet'}\n\nHow can I help you grow smarter today? You can ask me for today's priority tasks, weekly care schedules, or customized botanical advice.`,
      timestamp: 'Just now'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Starter prompts
  const starterPrompts = [
    "What should I do for my garden today?",
    "Which plants are suitable for my balcony?",
    "Create a weekly care routine for my plants.",
    "When should I water my basil?",
    "How can I improve my garden setup?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const gardenContext = {
        profile,
        userPlants: plants,
        pendingTasks: tasks.filter(t => !t.is_completed)
      };

      const res = await askGeminiChat(query, messages, gardenContext);

      const botMsg = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: res.reply || 'I am tending the garden now. Please ask another botanical query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          role: 'assistant',
          content: "I ran into a temporary hiccup connecting to the botanical intelligence engine. Please try your question again in a moment.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id, text) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleReset() {
    if (window.confirm("Start a fresh conversation?")) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `### 🌿 Fresh Gardening Session\n\nI am ready! What would you like to explore next?`,
          timestamp: 'Just now'
        }
      ]);
    }
  }

  return (
    <div style={{
      flex: 1,
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(0.5rem, 1.5vw, 1rem)',
      maxWidth: '1080px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* HEADER BAR - Compact & Screen-Optimized */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.65rem',
        backgroundColor: '#ffffff',
        padding: '0.65rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-forest)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(27, 67, 50, 0.25)',
            flexShrink: 0
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-forest-dark)', margin: 0, lineHeight: 1.2 }}>
                Gemini Gardening Assistant
              </h1>
              <span className="badge badge-forest" style={{ fontSize: '0.625rem', padding: '0.1rem 0.45rem' }}>
                Online & Context Loaded
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '1px' }}>
              Personalized for {profile?.garden_space || 'Balcony'} • {plants.length} plant{plants.length === 1 ? '' : 's'} tracked
            </span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
        >
          <RotateCcw size={14} />
          <span>New Chat</span>
        </button>
      </div>

      {/* CHAT WINDOW CARD - Viewport-Fitted */}
      <div className="card" style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* Messages Container - Internal Scrolling */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: 'clamp(0.85rem, 2vw, 1.25rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map(msg => {
            const isAssistant = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                  maxWidth: isAssistant ? '88%' : '78%'
                }}
              >
                {isAssistant && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-mint-subtle)',
                    color: 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Sprout size={16} />
                  </div>
                )}

                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: isAssistant ? '0 16px 16px 16px' : '16px 0 16px 16px',
                  backgroundColor: isAssistant ? 'var(--color-bg-app)' : 'var(--color-forest)',
                  color: isAssistant ? 'var(--color-text-primary)' : '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  border: isAssistant ? '1px solid var(--color-border)' : 'none',
                  lineHeight: 1.55,
                  fontSize: '0.875rem',
                  position: 'relative'
                }}>
                  {/* Markdown Chat Content */}
                  <div className="markdown-chat-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                    paddingTop: '0.4rem',
                    borderTop: isAssistant ? '1px solid var(--color-border)' : '1px solid rgba(255,255,255,0.2)',
                    fontSize: '0.6875rem',
                    color: isAssistant ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.7)'
                  }}>
                    <span>{msg.timestamp}</span>
                    {isAssistant && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', background: 'none', border: 'none' }}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span style={{ color: copiedId === msg.id ? '#10b981' : 'inherit' }}>
                          {copiedId === msg.id ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-mint-subtle)',
                color: 'var(--color-forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={16} />
              </div>
              <div style={{
                padding: '0.75rem 1.15rem',
                borderRadius: '0 16px 16px 16px',
                backgroundColor: 'var(--color-bg-app)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.84rem',
                color: 'var(--color-text-secondary)'
              }}>
                <span>Gemini is generating botanical advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* STARTER PROMPTS STRIP - Always Visible Above Input */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          gap: '0.45rem',
          overflowX: 'auto',
          padding: '0.55rem 1rem',
          backgroundColor: 'var(--color-bg-app)',
          borderTop: '1px solid var(--color-border)',
          scrollbarWidth: 'none'
        }}>
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-forest)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* INPUT FORM - Always Locked to Bottom of Screen */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <input
            type="text"
            placeholder="Ask a gardening question (e.g. 'How often should I water my tomato in summer?')..."
            className="form-input"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            disabled={loading}
            style={{ flex: 1, fontSize: '0.875rem', padding: '0.65rem 0.95rem' }}
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.35rem', gap: '0.45rem', flexShrink: 0 }}
          >
            <span>Send</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
