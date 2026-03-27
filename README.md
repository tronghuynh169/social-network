# 🌐 Social Network - Full Stack Web Application

A comprehensive real-time social networking platform built with modern web technologies. Features real-time messaging, video calls, post creation, user profiles, and a complete notification system.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Real-time Features](#-real-time-features)
- [Deployment](#-deployment)

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with email verification
- Secure login with JWT tokens
- Password reset via email
- Protected routes and API endpoints
- Session management

### 💬 Messaging & Chat
- **One-on-one and group conversations** with real-time updates
- **Message features:**
  - Text and file/image attachments
  - Message editing and deletion
  - Message reactions (likes)
  - Message threading and replies
  - Read/unread status tracking
  - Message recall functionality
- **Conversation management** (create, edit, manage members)
- **Group controls** (add/remove members, change admin, set emoji)

### 📸 Posts & Social Features
- Create posts with **multiple images/videos**
- **Post visibility control** (public, followers-only, private)
- **Social interactions:**
  - Like/unlike posts
  - Comments with nested replies
  - Comment reactions
  - Save posts for later
- **Post discovery** (feed, trending, user-specific)

### 👤 User Profiles
- **Comprehensive profile management:**
  - Username, full name, bio, avatar
  - Location, gender, website links
  - Private/public account options
  - Account customization
- **Social connections:**
  - Follow/unfollow users
  - View followers and following lists
  - Follower recommendations
- **Profile discovery** (search by username, name, slug)

### 🔔 Notifications (Real-time)
- Instant notifications for:
  - New messages and replies
  - Post likes and comments
  - User follows
  - Reactions on messages
- Mark as read / mark all as read functionality
- Delete notifications

### 📞 Video/Voice Calls (P2P WebRTC)
- **Initiate and receive calls** in real-time
- **Call features:**
  - Audio/video streaming using WebRTC
  - Accept, decline, or end calls
  - Real-time signaling via Socket.io
  - Call status notifications

### 📖 Stories
- Share 24-hour expiring stories with images
- View tracking (see who viewed your stories)
- Auto-expiration after 24 hours

---

## 🛠️ Technology Stack

### Frontend
```
Framework & Build:
  • React 19.0.0 - UI library
  • Vite 6.2.3 - Build tool and dev server
  • React Router v7 - Client-side routing

State Management:
  • Context API - Global state (User, Post, Call)
  • Zustand 5.0.3 - Additional state management
  • Redux 5.0.1 - Optional state management setup

Real-time Communication:
  • Socket.io-client 4.8.1 - WebSocket client
  • Simple-peer 9.11.1 - WebRTC implementation

HTTP & API:
  • Axios 1.8.3 - HTTP client with interceptors

UI & Styling:
  • Tailwind CSS 4.0 - Utility-first CSS framework
  • SCSS/Sass - Advanced styling
  • Radix UI - Headless UI components
  • Lucide React - Icon library
  • Framer Motion 12.6.3 - Animation library
  • Class Variance Authority - Component styling patterns

Utilities:
  • date-fns & dayjs - Date manipulation
  • emoji-regex - Emoji parsing
  • slugify - URL slug generation
  • unidecode - Unicode text conversion
  • React Modal - Modal dialogs
  • React DatePicker - Date selection
  • React Spinners - Loading indicators
  • Swiper - Carousel/slider component
```

### Backend
```
Runtime & Framework:
  • Node.js - JavaScript runtime
  • Express.js 4.21.2 - Web framework
  • Mongoose 8.13.1 - MongoDB ODM

Database:
  • MongoDB - NoSQL database

Authentication & Security:
  • jsonwebtoken 9.0.2 - JWT implementation
  • bcryptjs 3.0.2 - Password hashing
  • CORS - Cross-origin resource sharing

Real-time Communication:
  • Socket.io 4.8.1 - WebSocket server
  • Simple-peer 9.11.1 - WebRTC signaling

File Management:
  • Multer 1.4.5-lts.1 - File upload middleware
  • Cloudinary 1.41.3 - Cloud storage service
  • Multer-storage-cloudinary - Cloudinary adapter

Email & Utilities:
  • Nodemailer 6.10.0 - Email sending
  • dotenv 16.4.7 - Environment variables
  • slugify - URL slug generation
  • remove-accents - Accent removal for search

Development:
  • Nodemon 3.1.9 - Auto-restart during development
```

---

## 📁 Project Structure

```
social-network/
├── README.md
├── client/                        # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   │   ├── ui/              # UI components (Post, User, Message)
│   │   │   └── hooks/           # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage/        # Main feed
│   │   │   ├── MessagePage/     # Chat interface
│   │   │   ├── ProfilePage/     # User profiles
│   │   │   ├── PostDetailPage/  # Single post view
│   │   │   ├── FriendPage/      # User discovery
│   │   │   └── AuthPage/        # Login, Register, Password Reset
│   │   ├── api/                 # API client functions
│   │   │   ├── auth.js          # Authentication endpoints
│   │   │   ├── chat.js          # Messaging endpoints
│   │   │   ├── post.js          # Posts endpoints
│   │   │   ├── profile.js       # Profile endpoints
│   │   │   ├── notification.js  # Notifications endpoints
│   │   │   └── avatar.js        # Avatar endpoints
│   │   ├── context/             # React Context providers
│   │   │   ├── UserContext.jsx  # User & auth state
│   │   │   ├── PostContext.jsx  # Posts & comments state
│   │   │   └── CallContext.jsx  # Video call state
│   │   ├── socket.js            # Socket.io client setup
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                        # Express backend application
    ├── src/
    │   ├── server.js            # App entry point
    │   ├── controllers/         # Request handlers
    │   │   ├── authController.js
    │   │   ├── chatController.js
    │   │   ├── postController.js
    │   │   ├── profileController.js
    │   │   ├── notificationController.js
    │   │   ├── avatarController.js
    │   │   └── uploadController.js
    │   ├── routes/              # API routes
    │   │   ├── authRoutes.js
    │   │   ├── chatRoutes.js
    │   │   ├── postRoutes.js
    │   │   ├── profileRoutes.js
    │   │   ├── notificationRoutes.js
    │   │   ├── avatarRoutes.js
    │   │   └── index.js
    │   ├── models/              # MongoDB schemas
    │   │   ├── User.js
    │   │   ├── Profile.js
    │   │   ├── Post.js
    │   │   ├── Message.js
    │   │   ├── Conversation.js
    │   │   ├── Notification.js
    │   │   ├── Comment.js
    │   │   └── Story.js
    │   ├── middleware/          # Express middleware
    │   │   ├── authMiddleware.js    # JWT verification
    │   │   └── uploadMiddleware.js  # File upload handling
    │   ├── database/            # Database configuration
    │   │   └── connection.js
    │   └── uploads/             # Local file storage
    │       ├── avatars/
    │       ├── messages/
    │       └── posts/
    ├── package.json
    └── .env                     # Environment variables
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager
- **Cloudinary account** (for file uploads)
- **Gmail account** (for email notifications)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/social-network.git
cd social-network
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## ⚙️ Configuration

### Backend Configuration (.env)

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-network
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-network

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Find "App passwords" and generate one for your app
4. Use this 16-character password in `EMAIL_PASS`

### Frontend Configuration

Update the API base URL in your frontend code:

```javascript
// In client/src/api files
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

Create a `.env` file in the `client/` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏃 Usage

### Development Mode

**Terminal 1: Start Backend**
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

**Terminal 2: Start Frontend**
```bash
cd client
npm run dev
# Frontend runs at http://localhost:5173
```

### Production Build

**Build Frontend:**
```bash
cd client
npm run build
# Output in 'dist' folder
```

**Start Backend:**
```bash
cd server
npm start
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
```
POST   /register              - Register new user
POST   /login                 - User login
GET    /me                    - Get current user (protected)
POST   /forgot-password       - Request password reset
POST   /reset-password/:token - Reset password with token
```

### Messaging (`/api/chat`)
```
# Conversations
POST   /conversation                           - Create conversation
GET    /conversation/:userId                   - Get user conversations
GET    /conversation/id/:conversationId        - Get conversation details
PUT    /conversation/:conversationId/emoji     - Update group emoji
POST   /conversation/change-admin              - Change group admin
POST   /conversation/:conversationId/members   - Add members
DELETE /conversation/:conversationId/member/:memberId - Remove member

# Messages
POST   /message                    - Send message
GET    /message/:conversationId    - Get messages
POST   /uploads                    - Upload message files
```

### Posts (`/api/posts`)
```
# Post Management
POST   /                       - Create post
GET    /                       - Get all posts
GET    /user/:id              - Get user posts
DELETE /:postId               - Delete post
PUT    /:postId               - Update post

# Interactions
POST   /:postId/like          - Like post
GET    /:postId/likes         - Get post likes
POST   /:postId/comments      - Add comment
POST   /:postId/comments/:commentId/like - Like comment
DELETE /:postId/comments/:commentId     - Delete comment
GET    /:postId/details       - Get post details
```

### Profiles (`/api/profile`)
```
GET    /profile               - Get all profiles
GET    /user/:userId          - Get profile by user ID
GET    /username/:username    - Get profile by username
PUT    /username/:username    - Update profile
POST   /follow/:profileId     - Follow user
DELETE /unfollow/:profileId   - Unfollow user
GET    /:profileId/followers  - Get followers
GET    /:profileId/following  - Get following
```

### Notifications (`/api/notifications`)
```
GET    /                  - Get notifications
PATCH  /:id/read          - Mark as read
PATCH  /read/all          - Mark all as read
DELETE /:id               - Delete notification
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  fullName: String,
  dateOfBirth: Date,
  slug: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  username: String,
  fullName: String,
  bio: String,
  avatar: String (URL),
  website: [String],
  location: String,
  gender: String (Nam/Nữ/Khác),
  isPrivate: Boolean,
  followers: [ObjectId] (ref: Profile),
  following: [ObjectId] (ref: Profile),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  caption: String,
  media: [{
    type: enum ['image', 'video'],
    url: String
  }],
  likes: [ObjectId] (ref: User),
  visibility: enum ['public', 'followers', 'private'],
  createdAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: Profile, required),
  conversation: ObjectId (ref: Conversation, required),
  text: String,
  files: [{
    name: String,
    url: String,
    type: String
  }],
  readBy: [ObjectId] (ref: Profile),
  likes: [ObjectId] (ref: Profile),
  replyTo: ObjectId (ref: Message),
  isRecalled: Boolean,
  isEdited: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Collection
```javascript
{
  _id: ObjectId,
  name: String (for groups),
  avatar: String,
  isGroup: Boolean (default: false),
  members: [ObjectId] (ref: Profile),
  latestMessage: ObjectId (ref: Message),
  admin: ObjectId (ref: Profile),
  emoji: String (default: "👍"),
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Profile, required),
  sender: ObjectId (ref: Profile),
  type: String (message, like, follow, comment),
  content: String,
  data: Object,
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### Comment Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  postId: ObjectId (ref: Post, required),
  content: String (required),
  likes: [ObjectId] (ref: User),
  replyTo: ObjectId (ref: Comment),
  createdAt: Date
}
```

### Story Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  imageUrl: String (required),
  viewers: [ObjectId] (ref: User),
  expiresAt: Date (auto 24h),
  createdAt: Date
}
```

---

## 🔊 Real-time Features (Socket.io)

### Server Events (Receiving from Client)
```javascript
// Messaging
socket.on('sendMessage', (data) => {...})
socket.on('conversationUpdated', (data) => {...})
socket.on('joinConversation', (conversationId) => {...})
socket.on('leaveConversation', (conversationId) => {...})
socket.on('likeMessage', (messageId) => {...})
socket.on('markMessagesAsRead', (data) => {...})
socket.on('recallMessage', (messageId) => {...})
socket.on('editMessage', (data) => {...})

// Conversation Management
socket.on('newGroupCreated', (groupData) => {...})
socket.on('deleteConversation', (conversationId) => {...})
socket.on('changeAdmin', (data) => {...})
socket.on('emojiUpdated', (data) => {...})

// Calls
socket.on('call-user', (callData) => {...})
socket.on('answer-call', (callData) => {...})
socket.on('decline-call', (callData) => {...})
```

### Client Events (Broadcasting from Server)
```javascript
// Messaging
socket.emit('receiveMessage', message)
socket.emit('conversationUpdated', conversation)
socket.emit('messageRead', messageData)
socket.emit('messageRecalled', messageId)
socket.emit('messageEdited', editedMessage)

// Notifications
socket.emit('newNotification', notification)
socket.emit('notificationDeleted', notificationId)

// Calls
socket.emit('incoming-call', callData)
socket.emit('call-accepted', callData)
socket.emit('call-ended', callData)
```

---

## 🌍 Deployment

### Docker (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
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

### Heroku / Railway / Vercel Deployment

**Environment Variables on Platform:**
- Set all variables from `.env` files
- Ensure MongoDB Atlas connection string is accessible

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel --prod
```

**Backend (Railway/Heroku):**
```bash
# Heroku
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Using Cloudflare Tunnel

For local development with public URL without port exposure:

```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:5000
```

This creates a public HTTPS URL accessible from anywhere for testing.

---

## 📝 Notes & Best Practices

✅ **Security:**
- Always use HTTPS in production
- Keep `.env` files out of version control
- Use strong JWT secrets
- Implement rate limiting on production
- Sanitize user inputs

✅ **Performance:**
- Implement pagination for large data sets
- Use database indexes on frequently queried fields
- Cache static files and API responses
- Optimize images before upload

✅ **Development:**
- Use ESLint for code quality
- Follow consistent naming conventions
- Write meaningful commit messages
- Keep components modular and reusable

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your-email@example.com

---

## 🆘 Support

For support, open an issue on GitHub or contact the maintainers.

**Useful Links:**
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Socket.io Documentation](https://socket.io/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📊 Project Statistics

- **Total Lines of Code:** ~15,000+
- **Frontend Components:** 50+
- **Backend Routes:** 30+
- **Database Models:** 8
- **Real-time Events:** 20+
- **API Endpoints:** 40+

---

**Last Updated:** March 27, 2026  
**Version:** 1.0.0

🚀 Happy coding!