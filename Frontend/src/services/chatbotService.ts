import { API_BASE } from './apiClient';

export interface ChatbotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  intent?: string;
  suggestedQuestions?: string[];
  isError?: boolean;
}

export interface ChatbotResponsePayload {
  answer: string;
  intent: string;
  suggestedQuestions: string[];
  confidence: number;
  isOffTopic: boolean;
  timestamp: string;
}

// Client-side fallback knowledge base in case backend is offline or unreachable
const CLIENT_KNOWLEDGE = [
  {
    patterns: [/log\s*in|sign\s*in|login|password|google\s*auth/i],
    title: 'User Login & Authentication',
    directAnswer: 'You can log in to the Chat Application using either your registered **Email & Password** or **Google Sign-In**.',
    steps: [
      'Click the **"Sign In"** button on the top-right navbar or **"Start Chatting"** on the landing page.',
      'Enter your email and password, or click **"Continue with Google"**.',
      'If you forgot your password, click **"Forgot Password?"** to get a 6-digit OTP verification code sent to your email.',
    ],
    followUps: ['How do I register a new account?', 'How does real-time chat work?', 'How is authentication secured?'],
  },
  {
    patterns: [/register|sign\s*up|signup|create\s*account/i],
    title: 'Account Registration',
    directAnswer: 'Creating an account is fast and simple.',
    steps: [
      'Click **"Get Started Free"** or **"Sign In"**.',
      'Select the **"Sign Up"** tab.',
      'Enter your Username, Email, and Password (min 6 characters).',
      'Submit the form or choose **"Sign up with Google"**.',
    ],
    followUps: ['How do I log in to my account?', 'How do I start chatting?', 'How do I create a group chat?'],
  },
  {
    patterns: [/chat|message|real-?time|instant|ticks|read\s*receipt/i],
    title: 'Real-Time Messaging System',
    directAnswer: 'Real-time messaging uses **Socket.IO** for instant, zero-delay communication.',
    steps: [
      'Select any contact or group from your sidebar.',
      'Type your message in the chat input bar and press Enter.',
      'Status ticks indicate real-time delivery: Single tick = Sent, Double ticks = Delivered, Blue ticks = Read.',
    ],
    followUps: ['Can I edit or delete sent messages?', 'How do I send voice notes or files?', 'How do video calls work?'],
  },
  {
    patterns: [/edit\s*message|delete\s*message|delete\s*for\s*(everyone|me)|reaction/i],
    title: 'Message Editing, Deletion & Reactions',
    directAnswer: 'You have complete control to edit, recall, or react to any message.',
    steps: [
      'Hover over any message bubble and click the **three dots (...)** menu.',
      'Choose **"Edit Message"** to fix typos (adds an edited label).',
      'Choose **"Delete for Everyone"** to recall from all users, or **"Delete for Me"**.',
      'Click the emoji reaction button to react instantly with 👍, ❤️, 😂, 🎉, or 🚀.',
    ],
    followUps: ['How do file attachments work?', 'How do I create a group chat?', 'How do video calls work?'],
  },
  {
    patterns: [/call|video|voice|audio\s*call|webrtc|screen\s*share/i],
    title: 'WebRTC Voice & Video Calling',
    directAnswer: 'High-definition **1-on-1 and group voice/video calls** with real-time **screen sharing** powered by WebRTC.',
    steps: [
      'Open a chat with a friend or group.',
      'Click the **Phone Icon** (audio call) or **Camera Icon** (video call) in the top-right header.',
      'In-call features: Microphone mute, video toggle, Picture-in-Picture (PiP), and **"Share Screen"**.',
      'Click the red **End Call** button to hang up.',
    ],
    followUps: ['What is Live Monitoring?', 'How do I troubleshoot microphone/camera issues?', 'How does real-time chat work?'],
  },
  {
    patterns: [/group|create\s*group|admin|members/i],
    title: 'Group Conversations & Administration',
    directAnswer: 'Collaborate with multiple users in custom group chats.',
    steps: [
      'Switch to the **"Groups"** tab in the sidebar.',
      'Click **"+ New Group"**, enter a Group Name, and choose members.',
      'Click **"Create Group"** to launch.',
      'Open **Group Details** from the chat header to add members, assign admin roles, or leave.',
    ],
    followUps: ['How do group video calls work?', 'Can I delete messages in a group?', 'How do unread badges work?'],
  },
  {
    patterns: [/monitor|live\s*monitoring|remote\s*view|consent/i],
    title: 'Live User Monitoring & Consent System',
    directAnswer: 'Live Monitoring allows administrative screen observation with **mandatory explicit user consent**.',
    steps: [
      'Open the **Live Monitoring** dashboard from navigation.',
      'When monitoring is requested, a prompt appears on the user screen.',
      'The user MUST explicitly click **"Allow Screen Share"** before any stream or screenshot is captured.',
      'The user can revoke screen sharing at any time.',
    ],
    followUps: ['How is application security maintained?', 'How do voice & video calls work?', 'How do I change privacy settings?'],
  },
  {
    patterns: [/setting|theme|dark\s*mode|light\s*mode|accent|profile|avatar|notification/i],
    title: 'Account Settings & Themes',
    directAnswer: 'Customize your theme, appearance, profile info, and privacy.',
    steps: [
      'Click the **Settings Icon** in the navigation bar.',
      '**Appearance**: Switch between Dark Mode and Light Mode, or choose custom accent colors.',
      '**Profile**: Update your display avatar, username, and bio.',
      '**Privacy & Notifications**: Manage online visibility, sound alerts, and blocked users.',
    ],
    followUps: ['How do I change my password?', 'How do I log out?', 'How does real-time chat work?'],
  },
  {
    patterns: [/tech\s*stack|architecture|technology|node|react|typescript|database|mongodb/i],
    title: 'Technology Stack & Architecture',
    directAnswer: 'Built on a modern enterprise full-stack TypeScript architecture.',
    steps: [
      '**Frontend**: React 18, TypeScript, Vite, Vanilla CSS design tokens, Lucide icons.',
      '**Backend**: Node.js & Express, TypeScript, Socket.IO, Pino logger, Helmet security.',
      '**Database**: MongoDB Atlas with Mongoose ODM schemas.',
      '**Media**: WebRTC for P2P video/audio/screen share; Web Audio API for voice notes.',
      '**Auth**: JWT dual-token (access + refresh), Bcrypt hashing, Google OAuth, Nodemailer OTP.',
    ],
    followUps: ['How is security implemented?', 'How do voice & video calls work?', 'How do I get started?'],
  },
  {
    patterns: [/security|privacy|jwt|safe|encrypt|cors|rate\s*limit/i],
    title: 'Security & Privacy Protections',
    directAnswer: 'Enterprise-grade safeguards protect your account, communications, and data.',
    steps: [
      '**JWT Dual-Token**: 15-minute access token + 7-day refresh token rotation.',
      '**Bcrypt Encryption**: Salting and cryptographic hashing on all passwords.',
      '**Helmet & CORS**: Active security headers and origin whitelisting.',
      '**Explicit Consent**: Screen sharing and monitoring require active user confirmation.',
    ],
    followUps: ['How does email OTP work?', 'What tech stack is used?', 'How do I change my password?'],
  },
  {
    patterns: [/troubleshoot|not\s*working|camera\s*error|mic\s*error|disconnect/i],
    title: 'Troubleshooting & Support',
    directAnswer: 'Quick fixes for common technical issues:',
    steps: [
      '**Camera / Mic Issue**: Allow browser permissions in your URL address bar.',
      '**Connection Issue**: Check your internet; the app will auto-reconnect WebSocket streams.',
      '**Forgot Password**: Use "Forgot Password" to receive an email OTP reset code.',
      '**File Size**: Ensure uploads are below 25MB.',
    ],
    followUps: ['How do voice & video calls work?', 'How do I contact support?', 'How does real-time chat work?'],
  },
];

const OFF_TOPIC_CLIENT_PATTERNS = [
  /weather|forecast|rain|temperature|stock|bitcoin|crypto|recipe|cook|movie|celebrity|sports|football|cricket|joke|poem|president|election|doctor|medical/i,
];

export async function askChatbotApi(
  query: string,
  history: Array<{ sender: 'user' | 'bot'; text: string }> = []
): Promise<ChatbotResponsePayload> {
  const cleanQuery = query.trim();

  try {
    const res = await fetch(`${API_BASE}/chatbot/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: cleanQuery,
        conversationHistory: history.slice(-6), // Send last 6 turns for context
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data as ChatbotResponsePayload;
      }
    }
  } catch (err) {
    console.warn('Backend chatbot API offline, using client knowledge fallback', err);
  }

  // Client-side fallback matching
  const qLower = cleanQuery.toLowerCase();

  // 1. Off-topic check
  if (OFF_TOPIC_CLIENT_PATTERNS.some((p) => p.test(qLower))) {
    return {
      answer: "⚠️ **Domain Scope Notice:**\n\nI am the dedicated AI Assistant for **this Bidirectional Chat & Video Calling Application**.\n\nI can assist with real-time messaging, WebRTC calling, group management, live monitoring, security, settings, and our tech stack.",
      intent: 'OFF_TOPIC',
      suggestedQuestions: [
        'How does real-time chat work?',
        'How do voice & video calls work?',
        'How do I create a group chat?',
        'How is authentication secured?',
      ],
      confidence: 1.0,
      isOffTopic: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 2. Greetings
  if (/^(hi|hello|hey|greetings|hola|namaste|good\s*(morning|afternoon|evening))\b/i.test(qLower)) {
    return {
      answer: "👋 **Hello! I'm your Chat Application Assistant.**\n\nI can answer questions about real-time messaging, WebRTC calling, groups, live monitoring, security, and settings. How can I help you today?",
      intent: 'GREETING',
      suggestedQuestions: [
        'How do I log in or sign up?',
        'How do voice & video calls work?',
        'How do I create a group chat?',
        'What tech stack is used?',
      ],
      confidence: 0.98,
      isOffTopic: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 3. Match knowledge
  for (const item of CLIENT_KNOWLEDGE) {
    if (item.patterns.some((p) => p.test(qLower))) {
      let ans = `**${item.title}**\n\n${item.directAnswer}\n\n**Step-by-Step Guide:**\n`;
      item.steps.forEach((s, i) => {
        ans += `${i + 1}. ${s}\n`;
      });

      return {
        answer: ans.trim(),
        intent: item.title,
        suggestedQuestions: item.followUps,
        confidence: 0.95,
        isOffTopic: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  // 4. Default clarification
  return {
    answer: "I specialize strictly in helping you with our **Chat & Video Calling Application**.\n\nCould you clarify which feature you'd like to explore?\n• **Messaging & Media** (Real-time chat, voice notes, emojis, GIFs)\n• **Calling** (WebRTC voice/video calls, screen sharing)\n• **Groups** (Create & manage group chats)\n• **Security & Settings** (JWT tokens, themes, notifications)",
    intent: 'CLARIFICATION_NEEDED',
    suggestedQuestions: [
      'How does real-time chat work?',
      'How do voice & video calls work?',
      'How do I create a group chat?',
      'What tech stack is used?',
    ],
    confidence: 0.5,
    isOffTopic: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
