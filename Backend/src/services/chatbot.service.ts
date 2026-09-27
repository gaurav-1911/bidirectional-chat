export interface ChatbotQueryRequest {
  query: string;
  conversationHistory?: Array<{
    sender: 'user' | 'bot';
    text: string;
  }>;
  sessionId?: string;
}

export interface ChatbotResponse {
  answer: string;
  intent: string;
  suggestedQuestions: string[];
  confidence: number;
  isOffTopic: boolean;
  timestamp: string;
}

// Verified Application Knowledge Base
interface KnowledgeTopic {
  id: string;
  category: string;
  keywords: string[];
  patterns: RegExp[];
  title: string;
  directAnswer: string;
  stepByStep?: string[];
  technicalDetails?: string[];
  followUps: string[];
}

const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'auth-login',
    category: 'AUTHENTICATION',
    keywords: ['login', 'sign in', 'log in', 'signin', 'access account', 'password', 'google login', 'sso'],
    patterns: [
      /how\s*(do|can)\s*i\s*(log\s*in|sign\s*in)/i,
      /where\s*(is|can\s*i\s*find)\s*(the\s*)?(login|sign\s*in)/i,
      /login\s*(process|page|button|screen|error|failed)/i,
      /google\s*(sign\s*in|login|auth)/i,
      /forgot\s*password|reset\s*password/i,
    ],
    title: 'User Login & Authentication',
    directAnswer: 'You can log in to the Chat Application using either your registered **Email & Password** or via **Google Sign-In**.',
    stepByStep: [
      'Click the **"Sign In"** button in the top navigation bar or the **"Start Chatting"** button on the homepage.',
      'Enter your registered email address and password, then click **"Sign In"**.',
      'Alternatively, click the **"Continue with Google"** button to authenticate instantly with your Google account.',
      'If you forgot your password, click **"Forgot Password?"** to receive a secure 6-digit OTP reset code via email.',
    ],
    technicalDetails: [
      'Backend uses **JWT (JSON Web Tokens)**: 15-minute access token paired with 7-day refresh token rotation.',
      'Passwords are cryptographically secured with **Bcrypt** hashing and multi-round salting.',
      'Email OTPs are dispatched using **Nodemailer SMTP** (Gmail).',
    ],
    followUps: [
      'How do I register a new account?',
      'How does email OTP verification work?',
      'How is authentication secured?',
    ],
  },
  {
    id: 'auth-register',
    category: 'AUTHENTICATION',
    keywords: ['register', 'sign up', 'create account', 'signup', 'new user', 'join'],
    patterns: [
      /how\s*(do|can)\s*i\s*(register|sign\s*up|create\s*an?\s*account)/i,
      /register\s*(process|page|button|screen)/i,
      /sign\s*up\s*(process|form|details)/i,
    ],
    title: 'Account Registration',
    directAnswer: 'Creating a new account is fast and free. You need a username, email address, and a strong password.',
    stepByStep: [
      'Click **"Get Started Free"** or **"Sign In"** on the landing page.',
      'Switch to the **"Sign Up"** tab in the authentication modal.',
      'Enter your chosen **Username**, **Email**, and **Password** (minimum 6 characters with letters and numbers).',
      'Click **"Create Account"** or choose **"Sign up with Google"** for one-tap onboarding.',
    ],
    technicalDetails: [
      'Validates unique email and username against MongoDB Atlas database.',
      'Automatically logs you in upon successful registration and assigns default online status.',
    ],
    followUps: [
      'How do I log in to my account?',
      'How do I start chatting with friends?',
      'How can I edit my profile?',
    ],
  },
  {
    id: 'realtime-chat',
    category: 'MESSAGING',
    keywords: ['chat', 'message', 'messaging', 'send message', 'instant messaging', 'text', 'ticks', 'read receipt'],
    patterns: [
      /how\s*(does|do)\s*(the\s*)?(real-?time\s*)?(chat|messaging|message)\s*work/i,
      /how\s*(do|can)\s*i\s*send\s*(a\s*)?message/i,
      /read\s*receipts?|delivery\s*ticks?|check\s*marks?/i,
      /typing\s*indicator/i,
    ],
    title: 'Real-Time Messaging System',
    directAnswer: 'Real-time messaging allows instant, bidirectional communication with zero page refreshes using **Socket.IO**.',
    stepByStep: [
      'From the chat dashboard, select a friend from the **"People"** or **"Chats"** sidebar.',
      'Type your message into the bottom message input field.',
      'Press **Enter** or click the send button to transmit your message instantly.',
      'Watch message delivery status in real time: Single tick = Sent, Double ticks = Delivered, Blue ticks = Read.',
    ],
    technicalDetails: [
      'Powered by **Socket.IO over WebSockets** with event broadcasting.',
      'Includes real-time typing indicators (`typing` and `stop_typing` events).',
      'Messages are persistently stored in MongoDB with timestamps, sender/receiver IDs, and status flags.',
    ],
    followUps: [
      'Can I edit or delete sent messages?',
      'How do I send images, files, or voice notes?',
      'How do I create a group chat?',
    ],
  },
  {
    id: 'message-actions',
    category: 'MESSAGING',
    keywords: ['edit message', 'delete message', 'delete for me', 'delete for everyone', 'reactions', 'forward'],
    patterns: [
      /how\s*(do|can)\s*i\s*(edit|delete|remove)\s*(a\s*)?message/i,
      /can\s*i\s*(edit|delete)\s*messages?/i,
      /delete\s*for\s*(everyone|me)/i,
      /forward\s*message/i,
    ],
    title: 'Message Editing, Deletion & Reactions',
    directAnswer: 'You have complete control over your messages with options to **edit**, **delete for everyone**, **delete for yourself**, and **react with emojis**.',
    stepByStep: [
      'Hover over or long-press any message in a chat window.',
      'Click the **three dots (...)** menu icon on the message bubble.',
      'Select **"Edit Message"** to modify message text (shows an "edited" tag).',
      'Select **"Delete for Everyone"** to recall the message from all participants, or **"Delete for Me"** to remove it locally.',
      'Click the emoji reaction button to attach quick reactions (👍, ❤️, 😂, 🎉, 🚀).',
    ],
    technicalDetails: [
      'Emits `message_edited` and `message_deleted` Socket.IO events to all active room subscribers.',
      'Soft-deletion flags and edit history audit trails are recorded in MongoDB.',
    ],
    followUps: [
      'How do file attachments work?',
      'How do I share GIFs and emojis?',
      'How do I create a group chat?',
    ],
  },
  {
    id: 'media-attachments',
    category: 'MESSAGING',
    keywords: ['file', 'image', 'photo', 'voice note', 'audio recording', 'gif', 'giphy', 'attachment', 'upload'],
    patterns: [
      /how\s*(do|can)\s*i\s*(send|upload|share)\s*(files?|photos?|images?|voice\s*notes?|gifs?|stickers?)/i,
      /can\s*i\s*(send|share)\s*(audio|voice|files?|images?|gifs?)/i,
      /file\s*upload\s*limit/i,
      /giphy|gif\s*picker|emoji\s*picker/i,
    ],
    title: 'Media Sharing, Voice Notes & GIFs',
    directAnswer: 'You can enrich conversations by sharing **images, video files, audio voice recordings, documents, and animated Giphy GIFs**.',
    stepByStep: [
      '**Files/Images**: Click the paperclip/attachment icon next to the chat input to upload photos, videos, or documents.',
      '**Voice Notes**: Click the microphone icon to record a voice message with real-time audio waveform visualizer, then click send.',
      '**GIFs & Emojis**: Click the smiley icon to open the **Unified Picker** (integrated EmojiMart and Giphy search engine).',
    ],
    technicalDetails: [
      'Uploaded files are validated for MIME type safety and served via backend `/uploads` endpoint.',
      'Voice notes are encoded via standard Web Audio API (Opus/WebM) and stored with duration metadata.',
    ],
    followUps: [
      'How does real-time chat work?',
      'How do voice & video calls work?',
      'What are the security safeguards for file uploads?',
    ],
  },
  {
    id: 'group-chats',
    category: 'GROUPS',
    keywords: ['group', 'groups', 'create group', 'group chat', 'add member', 'admin', 'group management'],
    patterns: [
      /how\s*(do|can)\s*i\s*(create|make|start)\s*(a\s*)?group/i,
      /group\s*(chat|management|members?|admin|settings)/i,
      /how\s*(do|can)\s*i\s*add\s*(members?|people)\s*to\s*(a\s*)?group/i,
      /can\s*i\s*leave\s*(a\s*)?group/i,
    ],
    title: 'Group Conversations & Administration',
    directAnswer: 'Group chats allow multi-user collaboration with custom group names, profile avatars, member permissions, and admin controls.',
    stepByStep: [
      'In the left navigation bar, switch to the **"Groups"** tab.',
      'Click the **"+ New Group"** button.',
      'Enter a **Group Name**, optional description, and select members from your contacts list.',
      'Click **"Create Group"** to launch the group chat room.',
      'To manage the group later, click the group header to open **Group Details** (view/add members, promote admins, or leave group).',
    ],
    technicalDetails: [
      'Uses Socket.IO room joining (`join_group` / `leave_group`).',
      'Group models support array of member ObjectId references and designated `admin` IDs.',
    ],
    followUps: [
      'How do voice and video calls work in groups?',
      'How do I edit or delete messages in groups?',
      'How do unread group counters work?',
    ],
  },
  {
    id: 'calling-webrtc',
    category: 'CALLING',
    keywords: ['call', 'video call', 'voice call', 'audio call', 'webrtc', 'screen share', 'screen sharing', 'camera', 'mic'],
    patterns: [
      /how\s*(do|can)\s*i\s*(make|start)\s*(a\s*)?(voice|video|audio)?\s*call/i,
      /how\s*(does|do)\s*(video|voice|webrtc|calling)\s*work/i,
      /screen\s*sharing?|share\s*screen/i,
      /picture\s*in\s*picture|pip|mute\s*mic|toggle\s*camera/i,
    ],
    title: 'WebRTC Voice & Video Calling',
    directAnswer: 'You can start high-definition **1-on-1 and group voice/video calls** with real-time **screen sharing** powered by WebRTC.',
    stepByStep: [
      'Open a chat conversation with any friend or group.',
      'Click the **Phone Icon** for an audio call or the **Video Camera Icon** for a video call in the top-right header.',
      'When the recipient accepts, the call window opens with live peer video streams.',
      'In-Call Controls: Toggle microphone mute, turn camera on/off, switch to Picture-in-Picture (PiP), or click **"Share Screen"**.',
      'Click the red **End Call** button when finished.',
    ],
    technicalDetails: [
      'Built using **Peer-to-Peer WebRTC** with STUN/TURN ICE negotiation.',
      'Socket.IO handles call signaling (`call_user`, `accept_call`, `ice_candidate`, `end_call`).',
      'Screen sharing uses `navigator.mediaDevices.getDisplayMedia` with dynamic bitrate adaptation.',
    ],
    followUps: [
      'What is Live Monitoring?',
      'How do I troubleshoot call or microphone issues?',
      'How does real-time chat work?',
    ],
  },
  {
    id: 'live-monitoring',
    category: 'MONITORING',
    keywords: ['live monitoring', 'monitoring', 'remote view', 'screen watch', 'consent', 'surveillance', 'stream'],
    patterns: [
      /what\s*is\s*live\s*monitoring/i,
      /how\s*(does|do)\s*monitoring\s*work/i,
      /screen\s*consent|remote\s*monitoring/i,
      /is\s*monitoring\s*safe|privacy\s*in\s*monitoring/i,
    ],
    title: 'Live User Monitoring & Consent System',
    directAnswer: 'Live Monitoring is an administrative feature that allows real-time user activity monitoring with strict **explicit user consent**.',
    stepByStep: [
      'Access the **"Live Monitoring"** section from the navigation menu.',
      'View the list of currently active online users and connection statuses.',
      'When initiating a live screen view, a **Consent Modal** is sent to the target user.',
      'The user MUST explicitly click **"Allow Screen Share"** before any stream or screenshot is captured.',
      'Users can revoke consent at any moment.',
    ],
    technicalDetails: [
      'Enforces privacy-first explicit consent protocols before initiating display media streams.',
      'Periodic snapshot records and stream metrics are transmitted over secure TLS WebSocket channels.',
    ],
    followUps: [
      'How is application security maintained?',
      'How do voice & video calls work?',
      'How do I adjust privacy settings?',
    ],
  },
  {
    id: 'settings-customization',
    category: 'SETTINGS',
    keywords: ['settings', 'theme', 'dark mode', 'light mode', 'accent color', 'profile', 'avatar', 'privacy', 'notifications'],
    patterns: [
      /how\s*(do|can)\s*i\s*(change|update)\s*(my\s*)?(theme|settings|profile|avatar|status|privacy)/i,
      /dark\s*mode|light\s*mode/i,
      /notification\s*settings|sound\s*alerts/i,
      /where\s*(is|are)\s*settings/i,
    ],
    title: 'Account Settings & Themes',
    directAnswer: 'You can customize your experience in the **Settings** view, including dark/light themes, accent colors, profile pictures, and privacy options.',
    stepByStep: [
      'Click the **Gear/Settings Icon** in the navigation bar.',
      '**Profile Tab**: Change your display name, status bio, and profile avatar picture.',
      '**Appearance Tab**: Toggle between **Dark Mode** and **Light Mode**, or customize your accent color theme.',
      '**Privacy Tab**: Control your online visibility, last-seen timestamps, and view blocked contacts.',
      '**Notifications Tab**: Toggle incoming message sound alerts and desktop notifications.',
    ],
    technicalDetails: [
      'Themes are dynamically handled via CSS custom variables (`[data-theme="dark"]` / `[data-theme="light"]`).',
      'Settings are synchronized to MongoDB Atlas via `/api/settings` REST endpoints.',
    ],
    followUps: [
      'How do I log out of my account?',
      'How do I change my password?',
      'How does real-time messaging work?',
    ],
  },
  {
    id: 'tech-stack',
    category: 'TECH_STACK',
    keywords: ['tech stack', 'technology', 'architecture', 'backend', 'frontend', 'database', 'mongodb', 'node', 'react', 'typescript', 'vite', 'socket.io', 'webrtc'],
    patterns: [
      /what\s*(is\s*the\s*)?tech(nology)?\s*stack/i,
      /how\s*is\s*(this\s*app|the\s*system)\s*built/i,
      /what\s*(frameworks?|libraries|database)\s*(do\s*you|are)\s*use/i,
      /architecture|system\s*design/i,
    ],
    title: 'Technology Stack & Architecture',
    directAnswer: 'This application is built with an enterprise-grade full-stack TypeScript architecture utilizing React 18, Node.js, Socket.IO, WebRTC, and MongoDB Atlas.',
    stepByStep: [
      '**Frontend**: React 18 with TypeScript, Vite bundler, custom Vanilla CSS design tokens (zero heavy CSS frameworks), Lucide icons.',
      '**Backend**: Node.js & Express with TypeScript, Socket.IO real-time engine, Pino high-throughput logging, Helmet security headers.',
      '**Database**: MongoDB Atlas with Mongoose ODM (structured schemas for Users, Messages, Groups, Settings, Calls).',
      '**Real-Time & Media**: Socket.IO for bidirectional events, WebRTC for P2P audio/video/screen share, Web Audio API for voice notes.',
      '**Authentication**: Dual-token JWT (access + refresh), Bcrypt password hashing, Google OAuth 2.0, Nodemailer SMTP.',
    ],
    technicalDetails: [
      'Clean modular architecture with decoupled controllers, routes, middlewares, services, and socket handlers.',
      'REST APIs documented with interactive **Swagger UI** (`/api-docs`).',
    ],
    followUps: [
      'How is authentication secured?',
      'How does WebRTC calling work?',
      'How do I run the application locally?',
    ],
  },
  {
    id: 'security-privacy',
    category: 'SECURITY',
    keywords: ['security', 'privacy', 'encryption', 'jwt', 'token', 'safe', 'protection', 'rate limit', 'xss', 'cors', 'helmet'],
    patterns: [
      /is\s*(this\s*app|my\s*data|chat)\s*secure/i,
      /how\s*(is|are)\s*(security|data|passwords)\s*handled/i,
      /security\s*features|encryption|jwt\s*protection/i,
    ],
    title: 'Security & Privacy Protections',
    directAnswer: 'The platform implements multi-layer enterprise security to safeguard user data, communications, and sessions.',
    stepByStep: [
      '**JWT Dual-Token Model**: 15-minute access token paired with secure 7-day refresh token rotation.',
      '**Bcrypt Password Encryption**: Salted and hashed passwords before any storage in the database.',
      '**Helmet Security Headers**: Protection against clickjacking, cross-site scripting (XSS), and MIME sniffing.',
      '**CORS & Rate Limiting**: Whitelisted origin boundaries and request throttling to prevent DDoS and brute-force attacks.',
      '**Payload Protection**: Strict 25MB limits to prevent denial-of-service memory exhaustion.',
    ],
    technicalDetails: [
      'All WebSocket connections require verified JWT handshake tokens.',
      'Screen sharing and monitoring strictly require active, explicit user consent confirmation.',
    ],
    followUps: [
      'How does email OTP verification work?',
      'What is Live Monitoring?',
      'What tech stack is used?',
    ],
  },
  {
    id: 'troubleshooting',
    category: 'TROUBLESHOOTING',
    keywords: ['troubleshoot', 'issue', 'problem', 'error', 'not working', 'camera not working', 'mic not working', 'connection failed', 'disconnected'],
    patterns: [
      /why\s*(is\s*it|am\s*i)\s*(not\s*working|disconnected|failing)/i,
      /camera\s*or\s*mic(rophone)?\s*(not\s*working|permission\s*denied|error)/i,
      /cannot\s*connect|socket\s*connection\s*error|failed\s*to\s*send/i,
      /troubleshoot(ing)?/i,
    ],
    title: 'Troubleshooting & Support',
    directAnswer: 'Here are quick solutions for common connection, audio/video, or login issues:',
    stepByStep: [
      '**Camera / Mic Permission Denied**: Check your browser address bar icon and ensure permissions for Camera and Microphone are set to **"Allow"**.',
      '**Socket Disconnection**: Ensure your internet connection is active. The application will automatically attempt reconnection.',
      '**Login Failed**: Double-check your email and password, or use the **"Forgot Password"** OTP reset option.',
      '**File Upload Error**: Ensure the attached file is within allowed sizes (max 25MB).',
    ],
    technicalDetails: [
      'Browser console logs provide real-time connection status from Socket.IO and WebRTC ICE agents.',
      'For developer assistance, reach out via the official GitHub repository.',
    ],
    followUps: [
      'How do voice & video calls work?',
      'How do I reset my password?',
      'How does real-time chat work?',
    ],
  },
];

// Off-topic detection patterns
const OFF_TOPIC_PATTERNS = [
  /weather|forecast|rain|temperature/i,
  /stock\s*market|bitcoin|crypto|shares|trading/i,
  /recipe|cook|baking|food\s*recipe|dinner/i,
  /movie|celebrity|actor|hollywood|bollywood|netflix/i,
  /sports|football|cricket|basketball|messi|ronaldo/i,
  /write\s*a\s*(poem|essay|story|song)|joke/i,
  /buy\s*(a\s*)?(phone|car|laptop|shoes|clothes)/i,
  /general\s*coding|python\s*script|machine\s*learning|write\s*a\s*python/i,
  /who\s*is\s*the\s*president|politics|election/i,
  /medical|symptoms|diagnosis|doctor/i,
];

export class ChatbotService {
  /**
   * Process a user query with intent detection, knowledge matching, and domain boundaries.
   */
  public static processQuery(req: ChatbotQueryRequest): ChatbotResponse {
    const rawQuery = (req.query || '').trim();
    const query = rawQuery.toLowerCase();
    const history = req.conversationHistory || [];

    // Empty query guard
    if (!query) {
      return {
        answer: 'Please type a question regarding our Chat Application (e.g., messaging, video calls, groups, security, or settings).',
        intent: 'EMPTY',
        suggestedQuestions: [
          'How does real-time chat work?',
          'How do voice & video calls work?',
          'How do I create a group chat?',
        ],
        confidence: 1.0,
        isOffTopic: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 1. Check Greetings & Pleasantries
    if (/^(hi|hello|hey|greetings|hola|namaste|good\s*(morning|afternoon|evening)|sup|howdy)\b/i.test(query)) {
      return {
        answer: "👋 **Hello! I'm your Chat Application Assistant.**\n\nI specialize strictly in helping you with our **Bidirectional Real-Time Chat & Video Calling platform**. I can answer questions about:\n\n• **Instant Messaging & Reactions**\n• **WebRTC Voice & Video Calling**\n• **Group Conversations & Management**\n• **Live Monitoring & User Consent**\n• **Account Security, JWT & OTP Verification**\n• **Technology Stack & Architecture**\n\nHow can I help you today?",
        intent: 'GREETING',
        suggestedQuestions: [
          'How do I get started?',
          'How do voice & video calls work?',
          'How is authentication secured?',
          'What tech stack is used?',
        ],
        confidence: 0.98,
        isOffTopic: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 2. Strict Domain Boundary Check
    const isExplicitlyOffTopic = OFF_TOPIC_PATTERNS.some((p) => p.test(query));
    if (isExplicitlyOffTopic) {
      return {
        answer: "⚠️ **Domain Scope Notice:**\n\nI am the specialized assistant for **this Bidirectional Chat & Video Calling Application** only.\n\nI cannot answer general queries about external topics (like politics, weather, recipes, or general programming). However, I'd be delighted to assist you with any feature of our chat and calling platform!",
        intent: 'OFF_TOPIC',
        suggestedQuestions: [
          'How does real-time chat work?',
          'How do I start a video call?',
          'How do I create a group chat?',
          'What is Live Monitoring?',
        ],
        confidence: 1.0,
        isOffTopic: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 3. Multi-Turn Context Follow-Up Resolver
    let resolvedQuery = query;
    if (/^(what about|how about|and that|how to do that|where is that|can i do that|tell me more|how do i do it)\b/i.test(query) && history.length > 0) {
      const lastUserMsg = [...history].reverse().find((h) => h.sender === 'user')?.text || '';
      resolvedQuery = `${lastUserMsg} ${query}`;
    }

    // 4. Intent & Knowledge Retrieval Matcher (Scoring Algorithm)
    let bestTopic: KnowledgeTopic | null = null;
    let highestScore = 0;

    for (const topic of KNOWLEDGE_BASE) {
      let score = 0;

      // Regex pattern match (High priority)
      for (const pattern of topic.patterns) {
        if (pattern.test(resolvedQuery)) {
          score += 5;
        }
      }

      // Keyword matches
      for (const kw of topic.keywords) {
        if (resolvedQuery.includes(kw)) {
          score += 2;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestTopic = topic;
      }
    }

    // 5. Build Formatted Response
    if (bestTopic && highestScore >= 2) {
      let formattedAnswer = `**${bestTopic.title}**\n\n${bestTopic.directAnswer}\n`;

      if (bestTopic.stepByStep && bestTopic.stepByStep.length > 0) {
        formattedAnswer += `\n**Step-by-Step Guide:**\n`;
        bestTopic.stepByStep.forEach((step, idx) => {
          formattedAnswer += `${idx + 1}. ${step}\n`;
        });
      }

      if (bestTopic.technicalDetails && bestTopic.technicalDetails.length > 0) {
        formattedAnswer += `\n**Technical Details:**\n`;
        bestTopic.technicalDetails.forEach((detail) => {
          formattedAnswer += `• ${detail}\n`;
        });
      }

      return {
        answer: formattedAnswer.trim(),
        intent: bestTopic.category,
        suggestedQuestions: bestTopic.followUps,
        confidence: Math.min(0.7 + highestScore * 0.05, 0.99),
        isOffTopic: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 6. Fallback with helpful application guide
    return {
      answer: "I want to make sure I give you the exact information you need regarding our **Chat & Video Calling Application**.\n\nCould you clarify which feature you are looking for?\n\n• **Authentication & Access** (Login, Sign-up, Google SSO, Password Reset)\n• **Communication** (Real-time 1-on-1 chat, Emojis, Voice Notes, File sharing)\n• **Collaboration** (Group creation, Admin roles, Member management)\n• **Calling & Media** (WebRTC Voice/Video calls, Screen sharing)\n• **Administrative & Security** (Live Monitoring consent, JWT tokens, Settings)",
      intent: 'CLARIFICATION_NEEDED',
      suggestedQuestions: [
        'How do I log in or sign up?',
        'How does real-time chat work?',
        'How do video & voice calls work?',
        'What tech stack is used?',
      ],
      confidence: 0.5,
      isOffTopic: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  /**
   * Get dynamic initial suggestions.
   */
  public static getInitialSuggestions(): string[] {
    return [
      'How does real-time chat work?',
      'How do voice & video calls work?',
      'How do I create a group chat?',
      'What is Live Monitoring?',
      'How is authentication secured?',
      'What tech stack is used?',
    ];
  }
}
