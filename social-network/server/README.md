# 🚀 Social Network Backend Server

Express.js + MongoDB + Socket.io backend for the Social Network application.

## 🛠️ Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for file uploads)
- Gmail account (for email notifications)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-network

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 📁 Project Structure

```
src/
├── server.js                 # Main entry point
├── controllers/              # Request handlers for routes
│   ├── authController.js
│   ├── chatController.js
│   ├── postController.js
│   ├── profileController.js
│   ├── notificationController.js
│   ├── avatarController.js
│   └── uploadController.js
├── routes/                   # API route definitions
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   ├── postRoutes.js
│   ├── profileRoutes.js
│   ├── notificationRoutes.js
│   ├── avatarRoutes.js
│   └── index.js
├── models/                   # MongoDB schemas
│   ├── User.js
│   ├── Profile.js
│   ├── Post.js
│   ├── Message.js
│   ├── Conversation.js
│   ├── Notification.js
│   ├── Comment.js
│   └── Story.js
├── middleware/               # Express middleware
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── database/                 # Database connection
│   └── connection.js
└── uploads/                  # File storage
    ├── avatars/
    ├── messages/
    └── posts/
```

---

## 🔌 API Routes

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user (protected)
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password

### Chat (`/api/chat`)
- `POST /conversation` - Create conversation
- `GET /conversation/:userId` - Get conversations
- `GET /message/:conversationId` - Get messages
- `POST /message` - Send message
- And more...

### Posts (`/api/posts`)
- `POST /` - Create post
- `GET /` - Get all posts
- `POST /:postId/like` - Like post
- `POST /:postId/comments` - Add comment
- And more...

### Profiles (`/api/profile`)
- `GET /profile` - Get all profiles
- `GET /user/:userId` - Get profile
- `POST /follow/:profileId` - Follow user
- And more...

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `PATCH /:id/read` - Mark as read
- `DELETE /:id` - Delete notification

---

## 📊 Database Models

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  dateOfBirth: Date,
  slug: String
}
```

### Profile
```javascript
{
  userId: ObjectId (ref: User),
  username: String,
  bio: String,
  avatar: String (URL),
  followers: [ObjectId],
  following: [ObjectId],
  isPrivate: Boolean
}
```

### Post
```javascript
{
  userId: ObjectId (ref: User),
  caption: String,
  media: [{type, url}],
  likes: [ObjectId],
  visibility: enum
}
```

### Message
```javascript
{
  sender: ObjectId,
  conversation: ObjectId,
  text: String,
  files: [{name, url, type}],
  readBy: [ObjectId],
  createdAt: Date
}
```

### Conversation
```javascript
{
  name: String,
  isGroup: Boolean,
  members: [ObjectId],
  latestMessage: ObjectId,
  admin: ObjectId,
  emoji: String
}
```

---

## 🔊 Socket.io Events

### Server Listening
```javascript
'sendMessage'
'conversationUpdated'
'joinConversation'
'leaveConversation'
'likeMessage'
'markMessagesAsRead'
'recallMessage'
'editMessage'
'call-user'
'answer-call'
'decline-call'
```

### Server Broadcasting
```javascript
io.emit('receiveMessage', message)
io.emit('newNotification', notification)
io.emit('incoming-call', callData)
```

---

## 🔐 Security Features

- ✅ JWT Authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with auth middleware
- ✅ CORS configuration
- ✅ Email verification for password reset
- ✅ Input validation

---

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiration time |
| `EMAIL_USER` | Gmail user email |
| `EMAIL_PASS` | Gmail app password |
| `CLOUDINARY_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ORIGIN` | Allowed CORS origins |
| `FRONTEND_URL` | Frontend URL for redirects |

---

## 🚀 Deployment

### Using Heroku

```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Using Railway

```bash
railway link
railway up
```

### Using Docker

```bash
docker build -t social-network-server .
docker run -p 5000:5000 social-network-server
```

---

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings for cloud databases

**Cloudinary Upload Issues**
- Verify API credentials
- Check upload folder settings
- Ensure image format is supported

**Email Not Sending**
- Enable "Less secure app access" or use app password
- Check Email_USER and EMAIL_PASS in `.env`
- Verify SMTP settings

**Socket.io Connection Issues**
- Check CORS_ORIGIN setting
- Verify server is running
- Check browser console for connection errors

---

## 📚 Useful Resources

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Socket.io Documentation](https://socket.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Nodemailer Guide](https://nodemailer.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## 📄 License

ISC License

---

**Version:** 1.0.0  
**Last Updated:** March 27, 2026
