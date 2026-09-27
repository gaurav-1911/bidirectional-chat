import React, { useState, useRef, useEffect, useCallback } from 'react';
import { askChatbotApi, ChatbotMessage } from '../../services/chatbotService';
import './WebsiteBotWidget.css';
import './WebsiteBotWidgetResponsive.css';

const INITIAL_GREETING: ChatbotMessage = {
  id: 'init-msg-1',
  sender: 'bot',
  text: "👋 Hi there! I'm your **Chat Application AI Assistant**.\n\nI can assist you specifically with our **Bidirectional Real-Time Chat & Video Calling platform**—including real-time messaging, WebRTC calling, group conversations, live monitoring, security, and technical architecture.\n\nHow can I help you today?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedQuestions: [
    'How does real-time chat work?',
    'How do voice & video calls work?',
    'Can I create group chats?',
    'What is Live Monitoring?',
    'How is authentication secured?',
    'What tech stack is used?',
  ],
};

export const WebsiteBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>(() => {
    const saved = sessionStorage.getItem('chatapp_bot_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fall back to initial greeting
      }
    }
    return [INITIAL_GREETING];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(
    INITIAL_GREETING.suggestedQuestions || []
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync with session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('chatapp_bot_messages', JSON.stringify(messages));
    } catch (e) {
      // Storage quota or error
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping, scrollToBottom]);

  // Handle horizontal mouse wheel on suggestion chips
  const handleSuggestionsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (suggestionsRef.current && e.deltaY !== 0) {
      suggestionsRef.current.scrollLeft += e.deltaY * 0.8;
    }
  };

  const handleSend = async (customText?: string) => {
    const query = (customText || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatbotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      // Prepare context history for API
      const historyForApi = newHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await askChatbotApi(query, historyForApi);

      const botMsg: ChatbotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.answer,
        time: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res.intent,
        suggestedQuestions: res.suggestedQuestions,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.suggestedQuestions && res.suggestedQuestions.length > 0) {
        setActiveSuggestions(res.suggestedQuestions);
      }
    } catch (error) {
      const errorMsg: ChatbotMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "I'm having trouble processing your request right now. Please try again or rephrase your question about our Chat Application.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([INITIAL_GREETING]);
    setActiveSuggestions(INITIAL_GREETING.suggestedQuestions || []);
    sessionStorage.removeItem('chatapp_bot_messages');
  };

  const handleRetry = (lastQuery: string) => {
    handleSend(lastQuery);
  };

  // Simple Markdown-to-JSX renderer for bold, lists, and code blocks
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Parse bold tags **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="website-bot-strong">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Render bullet lines with styling
      if (line.trim().startsWith('•')) {
        return (
          <div key={lineIdx} className="website-bot-bullet-line">
            {formattedLine}
          </div>
        );
      }

      // Render numbered step lines
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={lineIdx} className="website-bot-step-line">
            {formattedLine}
          </div>
        );
      }

      return (
        <div key={lineIdx} className="website-bot-paragraph-line">
          {formattedLine || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="website-bot-widget-container">
      {/* 1. Floating Launcher Button */}
      <button
        className="website-bot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close AI Assistant' : 'Open ChatApp AI Assistant'}
        aria-label="ChatApp AI Assistant"
      >
        <span className="website-bot-pulse-dot" />
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* 2. Interactive Enterprise Chatbot Window */}
      {isOpen && (
        <div className="website-bot-window" role="dialog" aria-label="AI Assistant Window">
          {/* Header */}
          <div className="website-bot-header">
            <div className="website-bot-header-left">
              <div className="website-bot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </div>
              <div className="website-bot-title-area">
                <h4>ChatApp AI Assistant</h4>
                <div className="website-bot-status-badge">
                  <span className="website-bot-status-indicator" />
                  <span>Enterprise Knowledge Guide</span>
                </div>
              </div>
            </div>

            <div className="website-bot-header-actions">
              <button
                className="website-bot-action-icon-btn"
                onClick={handleClear}
                title="Clear Conversation History"
                aria-label="Clear chat"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
              <button
                className="website-bot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize AI Assistant"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="website-bot-messages">
            {messages.map((m, idx) => (
              <div key={m.id} className={`website-bot-msg-row ${m.sender} ${m.isError ? 'has-error' : ''}`}>
                {m.sender === 'bot' && (
                  <div className="website-bot-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <circle cx="9" cy="13" r="1" fill="currentColor" />
                      <circle cx="15" cy="13" r="1" fill="currentColor" />
                    </svg>
                  </div>
                )}
                <div className="website-bot-msg-bubble-container">
                  <div className="website-bot-msg-bubble">
                    <div className="website-bot-msg-content">{renderFormattedText(m.text)}</div>
                    <div className="website-bot-msg-meta">
                      <span className="website-bot-msg-time">{m.time}</span>
                      {m.sender === 'bot' && (
                        <button
                          className="website-bot-copy-btn"
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <span className="copied-tag">Copied!</span>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {m.isError && idx === messages.length - 1 && (
                    <button
                      className="website-bot-retry-btn"
                      onClick={() => {
                        const lastUser = [...messages].reverse().find((x) => x.sender === 'user');
                        if (lastUser) handleRetry(lastUser.text);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                      Retry Request
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="website-bot-msg-row bot">
                <div className="website-bot-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                  </svg>
                </div>
                <div className="website-bot-typing">
                  <span className="website-bot-typing-dot" />
                  <span className="website-bot-typing-dot" />
                  <span className="website-bot-typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Suggestions */}
          {activeSuggestions.length > 0 && (
            <div className="website-bot-suggestions-area">
              <span className="website-bot-suggestions-label">Suggested Inquiries:</span>
              <div
                ref={suggestionsRef}
                onWheel={handleSuggestionsWheel}
                className="website-bot-suggestions-scroll"
              >
                {activeSuggestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="website-bot-chip-btn"
                    onClick={() => handleSend(q)}
                    disabled={isTyping}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box Form */}
          <form
            className="website-bot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              className="website-bot-input"
              placeholder="Ask anything about our Chat App..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="website-bot-send-btn"
              disabled={!inputText.trim() || isTyping}
              title="Send inquiry"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
