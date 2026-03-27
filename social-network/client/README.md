# 💻 Social Network Client (Frontend)

Modern React 19 + Vite frontend for the Social Network application with real-time messaging, video calls, and social features.

## 🛠️ Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
```

**Preview Build:**
```bash
npm run preview
```

**Linting:**
```bash
npm run lint
```

Frontend will run on `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/               # Reusable components
│   ├── layout/              # Layout components
│   │   ├── AuthLayout.jsx
│   │   └── DefaultLayout/
│   ├── ui/                  # UI components
│   │   ├── DropdownMenu/
│   │   ├── MessageUI/
│   │   ├── NotificationUI/
│   │   ├── PostUI/
│   │   ├── ProfileUI/
│   │   └── ...
│   ├── EmojiModal.jsx
│   └── hooks/               # Custom React hooks
├── pages/                   # Page components
│   ├── HomePage/
│   ├── MessagePage/
│   ├── ProfilePage/
│   ├── PostDetailPage/
│   ├── FriendPage/
│   └── AuthPage/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── ForgotPassword.jsx
│       └── ResetPassword.jsx
├── api/                     # API client functions
│   ├── auth.js              # Authentication endpoints
│   ├── chat.js              # Messaging endpoints
│   ├── post.js              # Posts endpoints
│   ├── profile.js           # Profile endpoints
│   ├── notification.js      # Notifications endpoints
│   └── avatar.js            # Avatar endpoints
├── context/                 # React Context
│   ├── UserContext.jsx      # User & auth state
│   ├── PostContext.jsx      # Posts & comments state
│   └── CallContext.jsx      # Video call state
├── lib/                     # Utilities
│   └── utils.ts
├── GlobalStyle/             # Global styles
│   └── globalStyle.scss
├── socket.js                # Socket.io configuration
├── App.jsx                  # Root component
└── main.jsx                 # Entry point
```

---

## 🎨 Styling

### Technologies Used
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **SCSS/Sass** - Advanced CSS features
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Key Style Files
- `GlobalStyle/globalStyle.scss` - Global styles
- Component-specific SCSS modules
- Tailwind utility classes in JSX

---

## 📡 API Integration

### API Client Setup

All API requests go through Axios with automatic JWT token injection:

```javascript
// client/src/api/auth.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance with interceptor
const apiClient = axios.create({
  baseURL: API_URL
});

// Auto-include JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Available API Functions

**Authentication**
```javascript
import { register, login, getCurrentUser, forgotPassword, resetPassword } from './api/auth';
```

**Posts**
```javascript
import { getPosts, createPost, likePost, addComment, deleteComment } from './api/post';
```

**Messages**
```javascript
import { getConversations, getMessages, sendMessage } from './api/chat';
```

**Profiles**
```javascript
import { getProfile, followUser, unfollowUser, updateProfile } from './api/profile';
```

**Notifications**
```javascript
import { getNotifications, markAsRead, deleteNotification } from './api/notification';
```

---

## 🔌 Real-time Features (Socket.io)

### Socket Connection

Socket.io is configured in `socket.js`:

```javascript
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

### Socket Events

**Listen for events:**
```javascript
socket.on('receiveMessage', (message) => {
  // Handle new message
});

socket.on('newNotification', (notification) => {
  // Handle notification
});

socket.on('incoming-call', (callData) => {
  // Handle incoming call
});
```

**Emit events:**
```javascript
socket.emit('sendMessage', messageData);
socket.emit('joinConversation', conversationId);
socket.emit('call-user', { user: userId, signal: signal });
```

---

## 🌐 Context API State Management

### UserContext
```javascript
{
  user: { id, username, email, fullName, ... },
  token: 'jwt_token',
  isAuthenticated: boolean,
  loading: boolean,
  error: null
}
```

### PostContext
```javascript
{
  posts: [],
  comments: [],
  loading: boolean,
  error: null
}
```

### CallContext
```javascript
{
  callInitiated: boolean,
  caller: { id, name, ... },
  callee: { id, name, ... },
  streamData: MediaStream
}
```

---

## 🎯 Key Features Implementation

### 🔐 Authentication Flow
1. User registers/logs in
2. Server returns JWT token
3. Token stored in localStorage
4. Token auto-injected in API requests
5. Protected routes redirect if not authenticated

### 💬 Real-time Messaging
1. User joins conversation via Socket.io
2. New messages broadcast to all members
3. Read status tracked in real-time
4. Socket events handle message updates, recalls, edits

### 📞 Video/Voice Calls
1. Simple-peer for WebRTC connection
2. Socket.io for signaling
3. Call modals handle UI
4. Media stream managed in CallContext

### 📸 Post Creation
1. Multiple image/video upload
2. Visibility settings (public/followers/private)
3. Real-time like and comment updates
4. Nested comment replies supported

---

## 🛠️ Developer Tools

### ESLint Configuration
```bash
npm run lint
```

Configured for React best practices and modern JavaScript.

### Build Process

Vite provides:
- Fast development server with HMR
- Optimized production build
- Code splitting
- Asset optimization

---

## 📦 Dependencies

### UI & Components
- React 19.0.0
- React Router v7
- Radix UI
- Lucide React
- Framer Motion

### State & Data
- Zustand
- Context API
- Axios

### Real-time
- Socket.io-client
- Simple-peer (WebRTC)

### Styling
- Tailwind CSS
- SCSS/Sass

### Utilities
- date-fns
- dayjs
- slugify
- emoji-regex

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder.

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker Deployment

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔒 Security Best Practices

✅ JWT tokens stored in localStorage  
✅ Sensitive data not exposed in source  
✅ API requests validated  
✅ CORS properly configured  
✅ XSS protection via React  
✅ Secure WebSocket connections (wss://)

---

## 📝 Component Development Guide

### Creating a New Component

```javascript
// components/MyComponent.jsx
import React, { useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import './MyComponent.scss';

export default function MyComponent() {
  const { user } = useContext(UserContext);
  const [state, setState] = useState(null);

  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
}
```

### Styling Components

```scss
// components/MyComponent.scss
.my-component {
  @apply p-4 rounded-lg bg-white shadow-md;

  .header {
    @apply font-bold text-lg mb-4;
  }

  .content {
    @apply flex gap-4;
  }
}
```

---

## 🐛 Troubleshooting

**CORS Errors**
- Check `VITE_API_URL` environment variable
- Verify backend CORS settings
- Ensure frontend URL is in backend's CORS_ORIGIN

**Socket.io Connection Failed**
- Check `VITE_SOCKET_URL` is correct
- Verify backend is running
- Check browser network tab

**API Requests 401 Unauthorized**
- Token might be expired
- Check localStorage for valid token
- Re-login user

**Vite Hot Module Replacement (HMR) Issues**
- Check `vite.config.js` HMR configuration
- Ensure development server address is correct

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io Client](https://socket.io/docs/v4/client-api)
- [React Router](https://reactrouter.com)

---

## 📄 License

ISC License

---

**Version:** 1.0.0  
**Last Updated:** March 27, 2026
