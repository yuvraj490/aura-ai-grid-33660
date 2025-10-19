# Multi-AI Hub 🚀

A premium, production-ready AI super-app where users can chat with multiple AI models, compare responses, and interact with legendary AI avatars.

## ✨ Features

### Core Functionality
- **Multi-Model Chat**: Compare responses from 15+ AI models side-by-side
- **Auto-AI Routing**: Automatically selects the best model for your prompt
- **AI Avatars**: Chat with historical figures and visionaries (Gandhi, Einstein, Elon Musk, etc.)
- **Real-time Streaming**: Character-by-character AI response streaming
- **Rate Limiting**: Smart usage tracking with daily limits for free users

### User Management
- **Authentication**: Sign up, login, and session persistence
- **Three Plans**: Free (10 prompts/day), Premium (₹499/month), Annual (₹4,999/year)
- **Profile Settings**: Edit name, email, preferences
- **Data Export**: Download chat history as JSON

### Admin Panel (ys8800221@gmail.com)
- **Real-time Stats**: Total users, active users, chats, messages
- **User Management**: Change plans, refill prompts, delete accounts
- **Analytics**: Plans distribution, model usage charts
- **Live Updates**: Stats refresh with actual data changes

## 🎨 Design

- **Theme**: Dark, moody, cinematic with teal/cyan accents
- **Typography**: Inter font family
- **Effects**: Glassmorphism, gradients, glow animations
- **Responsive**: Fully mobile-friendly

## 🚀 Quick Start

### Default Admin Account
- **Email**: ys8800221@gmail.com
- **Access**: Full admin privileges with user management

### User Flow
1. Visit landing page and explore features
2. Sign up for free account (10 prompts/day)
3. Start chatting in Dashboard
4. Try Avatar mode to chat with legends
5. Upgrade to Premium for unlimited access

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Global navigation
│   └── ui/                 # shadcn UI components
├── contexts/
│   └── AuthContext.tsx     # Authentication state
├── pages/
│   ├── Landing.tsx         # Home page
│   ├── Login.tsx           # Sign in
│   ├── Signup.tsx          # Create account
│   ├── Dashboard.tsx       # Main chat interface
│   ├── Avatars.tsx         # AI avatars gallery
│   ├── Settings.tsx        # User preferences
│   ├── Billing.tsx         # Subscription management
│   ├── Help.tsx            # FAQ and support
│   └── Admin.tsx           # Admin panel
├── utils/
│   ├── auth.ts             # Auth utilities
│   ├── storage.ts          # Chat storage
│   └── aiModels.ts         # AI model definitions
└── App.tsx                 # Main app component
```

## 🤖 AI Models

### Fast Response (< 100ms)
- Allam 2 7B
- LLaMA 3.1 8B Instant
- LLaMA Guard 4 12B

### Long-form (Complex Reasoning)
- LLaMA 3.3 70B Versatile
- LLaMA 4 Scout 17B
- LLaMA 4 Maverick 17B
- Kimi K2 Instruct
- GPT-OSS 120B

### Specialized
- Groq Compound
- Qwen 3 32B
- GPT-OSS 20B

## ⌨️ Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Ctrl + K**: Search models
- **N**: New chat

## 💾 Data Storage

All data is stored locally in browser `localStorage`:
- User accounts: `multiAiHub_users`
- Current user: `multiAiHub_currentUser`
- Chats: `multiAiHub_chats_{userId}`

## 🎯 Rate Limiting

- **Free**: 10 prompts/day, resets at midnight
- **Premium/Annual**: Unlimited prompts
- **Admin**: Unlimited + can refill any user

## 📊 Admin Features

The admin panel provides:
1. **Real Stats**: All metrics calculated from actual data
2. **Plan Management**: Change any user's plan instantly
3. **User Actions**: Refill prompts, delete accounts
4. **Analytics**: Visual charts for plans and model usage

## 🔒 Security Notes

This is a demo application with mock authentication. For production:
- Implement proper password hashing
- Use backend APIs for auth
- Add rate limiting on server side
- Secure admin routes
- Implement HTTPS

## 🎨 Customization

### Theme Colors (index.css)
- Primary: Teal/Cyan (189° 100% 50%)
- Secondary: Purple (280° 60% 55%)
- Background: Deep charcoal (240° 20% 5%)

### AI Models (aiModels.ts)
Add new models by extending the `AI_MODELS` array.

## 📝 TODO for Backend Integration

Search codebase for `// TODO_BACKEND` comments:
- Real AI API integration
- Email sending to admin
- Persistent database storage
- Payment gateway integration
- Real authentication

## 🚀 Deployment

1. Build: `npm run build`
2. Deploy `dist/` folder to your hosting
3. Set up environment variables if using real APIs

## 📞 Support

Contact: ys8800221@gmail.com
Help: Visit /help page for FAQ and contact form

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and shadcn/ui
