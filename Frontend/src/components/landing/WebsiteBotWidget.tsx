import React, { useState, useRef, useEffect } from 'react';
import './WebsiteBotWidget.css';
import './WebsiteBotWidgetResponsive.css';

interface BotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const INITIAL_GREETING: BotMessage = {
  id: 'init-1',
  sender: 'bot',
  text: "👋 Hi there! I'm your **Chat Application AI Assistant**. I can answer any questions specifically about this platform—including real-time chat, WebRTC video/voice calls, group conversations, live monitoring, security, and technical architecture. How can I help you today?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_SUGGESTIONS = [
  'How does real-time chat work?',
  'How do voice & video calls work?',
  'Can I create group chats?',
  'What is Live Monitoring?',
  'How is authentication secured?',
  'Can I share images and voice notes?',
  'What tech stack is used?',
];

export const WebsiteBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestionsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (suggestionsRef.current && e.deltaY !== 0) {
      suggestionsRef.current.scrollLeft += e.deltaY * 0.8;
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase().trim();

    // 1. Greetings & identity
    if (/^(hi|hello|hey|greetings|hola|namaste|good\s*(morning|afternoon|evening)|who are you|what is this)/i.test(q)) {
      return "Hello! I am the official AI Assistant for this **Bidirectional Real-Time Chat & Video Calling Application**. I can answer any question about our messaging features, WebRTC calling, group collaboration, live monitoring, security, or technology stack. What would you like to explore?";
    }

    // 2. Real-time messaging & Socket.io
    if (/real-?time|socket|websocket|message|chat|instant|broadcast|delay|latency/i.test(q) && !/video|call|monitor|group/i.test(q)) {
      return "💬 **Real-Time Messaging:**\nOur app uses **Socket.IO over WebSockets** for instant, bidirectional message delivery with zero page refreshes. Features include:\n• Instant delivery & read receipts (ticks)\n• Real-time typing indicators\n• Emoji reactions & Giphy GIF picker\n• In-chat voice audio recording\n• File attachments (images, videos, documents)\n• Edit and delete messages (for me / for everyone)";
    }

    // 3. Voice and Video Calling & WebRTC
    if (/call|video|audio|voice|webrtc|screen\s*share|camera|mic|stream/i.test(q)) {
      return "📞 **Voice & Video Calling:**\nBuilt with **peer-to-peer WebRTC**:\n• **1-on-1 and Group Calls**: High-definition crystal-clear audio and video.\n• **Screen Sharing**: Broadcast your screen in real time with built-in consent.\n• **In-Call Controls**: Instant microphone mute, camera toggle, and dynamic participant video grids with PiP (Picture-in-Picture).\n• **ICE & STUN/TURN**: Optimized connection negotiation for low-latency peer streaming.";
    }

    // 4. Group Chats
    if (/group|channel|community|members|admin|create group/i.test(q)) {
      return "👥 **Group Conversations:**\n• Create custom groups with custom group avatars and member lists.\n• Real-time multi-user group chat broadcasting.\n• Group details modal to view members, add new participants, assign admin roles, or leave the group.\n• Unread counters and synchronized group activity logs.";
    }

    // 5. Live Monitoring
    if (/monitor|live monitoring|screen\s*watch|spy|streamer|screenshot|remote view/i.test(q)) {
      return "🛡️ **Live User Monitoring:**\n• Provides a specialized administrative dashboard to view active online users.\n• **Explicit User Consent**: Users must explicitly accept screen-share consent requests before any live screen stream begins.\n• Captures real-time stream status, connection health, and periodic screenshot records stored securely.";
    }

    // 6. Security, Authentication, Passwords & JWT
    if (/auth|security|login|register|signup|jwt|token|password|hash|bcrypt|google|oauth|session|safe|encrypt/i.test(q)) {
      return "🔒 **Enterprise-Grade Security & Authentication:**\n• **JWT Authentication**: Short-lived access tokens (15m) paired with 7-day refresh token rotation.\n• **Password Hashing**: Passwords are encrypted with Bcrypt and multi-round salting.\n• **Google OAuth SSO**: One-tap sign in with verified Google accounts.\n• **Security Headers & Protection**: Integrated Helmet headers, Rate limiting, CORS whitelist, and XSS sanitization.";
    }

    // 7. Email Verification & OTP
    if (/otp|email|verification|nodemailer|smtp|code|2fa/i.test(q)) {
      return "📧 **Email OTP Verification:**\n• Integrated with **Nodemailer SMTP** (Gmail).\n• Delivers secure 6-digit one-time passwords directly to your registered email for account verification and password resets.";
    }

    // 8. Files, Media, GIFs & Emojis
    if (/file|image|photo|audio|upload|media|gif|giphy|emoji|picker/i.test(q)) {
      return "📁 **Media & Rich Expressions:**\n• **File Uploads**: Send photos, videos, and document attachments with automated MIME validation.\n• **Voice Notes**: In-browser audio recorder with interactive waveform playback.\n• **Unified Picker**: Integrated EmojiMart and Giphy GIF search modal.";
    }

    // 9. Settings & Customization
    if (/setting|theme|dark\s*mode|light\s*mode|privacy|wallpaper|notification|sound/i.test(q)) {
      return "⚙️ **Customization & Privacy Settings:**\n• **Themes**: Seamless toggle between Dark and Light mode with customizable accent themes.\n• **Privacy Controls**: Adjust online visibility, last seen status, and manage blocked users.\n• **Sound & Notifications**: Customize incoming message/call ringtones and desktop alerts.";
    }

    // 10. Technology Stack & Architecture
    if (/tech|stack|backend|frontend|database|mongodb|redis|vite|react|node|typescript|library/i.test(q)) {
      return "⚡ **Technology Architecture:**\n• **Frontend**: React 18, TypeScript, Vite, Vanilla CSS design system.\n• **Backend**: Node.js, Express, TypeScript, Socket.IO, Pino logger, Helmet.\n• **Database**: MongoDB Atlas with Mongoose ODM.\n• **Cache & Multi-Server**: Optional Redis adapter for multi-instance scaling.";
    }

    // 11. Contact / Support
    if (/contact|support|email address|developer|author|gaurav/i.test(q)) {
      return "📬 **Contact & Support:**\nFor inquiries or support, you can reach out via official contact at:\n📧 **gauravbhai1911@gmail.com**\nor connect via GitHub: `https://github.com/gaurav-1911/bidirectional-chat`";
    }

    // 12. How to start / Sign up
    if (/how to start|get started|how to use|join|try/i.test(q)) {
      return "🚀 **Getting Started:**\n1. Click the **'Get Started Free'** or **'Sign In'** button on this page.\n2. Create an account with your username, email, and password (or use Google Sign-In).\n3. Once logged in, explore people in the People tab or invite friends to start chatting and calling instantly!";
    }

    // Strict Boundary Rejection for unrelated queries
    return "⚠️ **Out of Scope:**\nI am specifically programmed to answer questions **only about this Chat Application and its website features** (e.g., messaging, WebRTC calling, groups, security, settings, or technology stack).\n\nPlease feel free to ask any question regarding our chat application!";
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: BotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Realistic bot response delay
    setTimeout(() => {
      const botReplyText = generateAnswer(query);
      const botMsg: BotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="website-bot-widget-container">
      {/* 1. Floating Toggle Button */}
      <button
        className="website-bot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close AI Assistant' : 'Chat with AI Assistant'}
        aria-label="Chat with AI Assistant"
      >
        <span className="website-bot-pulse-dot" />
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* 2. Interactive Bot Window */}
      {isOpen && (
        <div className="website-bot-window">
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
                  Website Guide & Help
                </div>
              </div>
            </div>
            <button className="website-bot-close-btn" onClick={() => setIsOpen(false)} title="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="website-bot-messages">
            {messages.map((m) => (
              <div key={m.id} className={`website-bot-msg-row ${m.sender}`}>
                {m.sender === 'bot' && (
                  <div className="website-bot-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <circle cx="9" cy="13" r="1" fill="currentColor" />
                      <circle cx="15" cy="13" r="1" fill="currentColor" />
                    </svg>
                  </div>
                )}
                <div className="website-bot-msg-bubble">
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                  <div className="website-bot-msg-time">{m.time}</div>
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
          <div className="website-bot-suggestions-area">
            <span className="website-bot-suggestions-label">Suggested Questions:</span>
            <div
              ref={suggestionsRef}
              onWheel={handleSuggestionsWheel}
              className="website-bot-suggestions-scroll"
            >
              {QUICK_SUGGESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  className="website-bot-chip-btn"
                  onClick={() => handleSend(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Form */}
          <form
            className="website-bot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="website-bot-input"
              placeholder="Ask anything about our Chat App..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="website-bot-send-btn"
              disabled={!inputText.trim()}
              title="Send message"
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
