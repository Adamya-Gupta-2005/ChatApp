# ChatApp 💬

A full-stack real-time chat application with video calling.

🔗 **[Live Demo](https://chat-app-phi-ten-ga4z8vshkm.vercel.app/)**

## Features
- 🔐 JWT authentication with HTTP-only cookies
- 💬 Real-time group chat with Socket.io
- 🔒 Password-protected private rooms
- 📨 Direct messaging between users
- 📹 1-on-1 video calling with WebRTC
- 🟢 Online/offline status

## Tech Stack
**Frontend:** React, Socket.io-client, WebRTC  
**Backend:** Node.js, Express, MongoDB, Socket.io  
**Auth:** JWT, bcrypt  


## Run Locally

\`\`\`bash
# Clone the repo
git clone https://github.com/Adamya-Gupta-2005/ChatApp

# Run server
cd server && npm install && npm run dev

# Run client
cd client && npm install && npm run dev
\`\`\`

## Environment Variables

Server `.env`:
\`\`\`
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
NODE_ENV=
TURN_USERNAME=
TURN_CREDENTIAL=
\`\`\`