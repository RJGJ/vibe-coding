# 🎥 Vibe Meeting - Google Meet Clone MVP

A functional **MEVN stack** (Vue 3, Express, Node.js, MongoDB-ready) video conferencing application with **WebRTC P2P** signaling and **Socket.io** real-time communication.

## 📋 Features

- ✅ **Real-time Video/Audio**: WebRTC peer-to-peer connections
- ✅ **Room Management**: Auto-join, room creation, automatic cleanup
- ✅ **State Persistence**: User ID and Room ID persist across refreshes using Pinia + localStorage
- ✅ **Mute/Video Toggles**: Control audio and video tracks in real-time
- ✅ **Socket.io Signaling**: Handle offer/answer/ICE candidates
- ✅ **Google STUN Servers**: Pre-configured public STUN servers for NAT traversal
- ✅ **Minimalist UI**: Clean dashboard and video grid interface
- ✅ **Multi-peer Support**: Support multiple simultaneous video streams
- ✅ **Production Ready**: Error handling, connection state management, cleanup

## 🏗️ Project Structure

```
vibe-coding/
├── server/                          # Express + Socket.io backend
│   ├── src/
│   │   ├── server.js                # Main server + Socket.io handlers
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication
│   │   └── utils/
│   │       ├── roomManager.js       # Room & participant management
│   │       └── auth.js              # Token generation/verification
│   ├── package.json
│   └── .env.example
│
├── client/                          # Vue 3 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.vue            # Authentication screen
│   │   │   ├── Dashboard.vue        # Room join/create
│   │   │   └── VideoGrid.vue        # Video conference view
│   │   ├── stores/
│   │   │   ├── userStore.js         # User state + persistence
│   │   │   ├── roomStore.js         # Room state + persistence
│   │   │   └── webrtcStore.js       # WebRTC peer connections
│   │   ├── utils/
│   │   │   ├── webrtc.js            # WebRTC peer connection logic
│   │   │   └── socket.js            # Socket.io client wrapper
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── router.js                # Vue Router configuration
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Microphone and camera permissions

### Installation

#### 1. Backend Setup

```bash
cd server
npm install

# Create .env from example
cp .env.example .env

# The following are optional for production OAuth:
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret

npm run dev
# Server runs on http://localhost:3001
```

#### 2. Frontend Setup

```bash
cd ../client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### Usage

1. **Open browser**: http://localhost:5173
2. **Enter username**: Any name works (OAuth optional for production)
3. **Create or join room**: Enter room ID or generate a new one
4. **Share room link**: Send room ID to others to join
5. **Toggle controls**:
   - 🎤 Mute/unmute audio
   - 📹 Start/stop video
   - Leave button to exit room

## 📡 Technical Architecture

### Backend (Express + Socket.io)

#### Endpoints

```
POST /auth/verify              - Verify Google OAuth token
GET  /auth/user                - Get current authenticated user
GET  /rooms/:roomId            - Check room status & participants
GET  /rooms                     - List all active rooms (protected)
```

#### Socket.io Events

```
CLIENT → SERVER:
- join-room                     - User joins a room
- offer                         - Send WebRTC offer
- answer                        - Send WebRTC answer
- ice-candidate                 - Send ICE candidate

SERVER → CLIENT:
- room-peers                    - Send existing peers in room
- peer-joined                   - Notify new peer joined
- offer                         - Receive offer from peer
- answer                        - Receive answer from peer
- ice-candidate                 - Receive ICE candidate
- peer-left                     - Notify peer disconnected
```

#### Room Lifecycle

```
1. User joins room
2. Server creates room in RoomManager
3. Server sends existing peers to new user
4. New user creates peer connections & sends offers
5. Peers exchange offer/answer/ICE candidates
6. WebRTC streams established
7. Last peer leaves → room auto-deleted from memory
```

### Frontend (Vue 3 + Pinia)

#### State Management

**userStore**: Persisted authentication

- `userId`, `userName`, `email`, `token`
- Methods: `setUser()`, `logout()`

**roomStore**: Persisted room state

- `roomId`, `participants` Map, `isInRoom`
- Methods: `setRoomId()`, `addParticipant()`, `clearRoom()`

**webrtcStore**: Non-persisted WebRTC state

- `peerConnections` Map, `localStream`, `peerStreams` Map
- `isAudioEnabled`, `isVideoEnabled` flags
- Methods: `toggleAudio()`, `toggleVideo()`, `addPeerConnection()`

#### WebRTC Flow

```
1. Get local media (getUserMedia)
2. User joins room → emit 'join-room'
3. Server responds with 'room-peers'
4. For each peer:
   a. Create RTCPeerConnection
   b. Add local stream tracks
   c. Create offer → send to peer
   d. Receive answer → set remote description
   e. Exchange ICE candidates
   f. Track event → add remote stream
5. Bind streams to video elements
6. On peer leave → close connection & clean up
```

### WebRTC Configuration

Uses **Google's public STUN servers**:

```javascript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ];
}
```

## 🔐 Authentication (Production Ready)

### Current (MVP)

Simulated authentication in `/auth/verify` endpoint. Any username works for testing.

### Production

Replace with Google OAuth 2.0:

```javascript
// server/src/utils/auth.js
const verifyGoogleToken = async (token) => {
  const response = await axios.post(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
  );

  return {
    userId: response.data.sub,
    userName: response.data.name,
    email: response.data.email,
  };
};
```

## 🛠️ Development

### Hot Reload

Both client and server support hot reload:

```bash
# Terminal 1: Backend (uses nodemon)
cd server && npm run dev

# Terminal 2: Frontend (uses Vite)
cd client && npm run dev
```

### Build for Production

```bash
# Frontend
cd client
npm run build
# Creates dist/ folder

# Backend
# Already production-ready, set NODE_ENV=production
cd server
NODE_ENV=production npm start
```

## 🐛 Troubleshooting

### "Permission denied for camera/microphone"

- Check browser permissions
- HTTPS required in production (except localhost)

### "Peer connection fails"

- Check firewall/NAT (STUN should help)
- Add TURN servers for restrictive networks:
  ```javascript
  { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
  ```

### "Socket connection refused"

- Ensure backend is running on port 3001
- Check `CLIENT_URL` in `.env` matches frontend domain

### "Video not displaying"

- Check browser console for errors
- Verify `getUserMedia` permissions granted
- Try `chrome://webrtc-internals` to debug WebRTC

## 📦 Dependencies

### Backend

- `express` - HTTP server
- `socket.io` - Real-time WebSocket
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### Frontend

- `vue@3` - UI framework
- `pinia` - State management
- `pinia-plugin-persistedstate` - State persistence
- `socket.io-client` - WebSocket client
- `vite` - Build tool

## 🔄 Scaling Considerations

### Current Limitations (P2P Mesh)

- Each peer connects to all other peers
- Works well for 4-6 participants
- Beyond 10+ → bandwidth/CPU intensive

### Production Improvements

1. **Selective Forwarding Unit (SFU)**
   - Server receives all streams, forwards selective streams
   - Better scalability (50+ participants)
   - Tools: Janus, Kurento, Mediasoup

2. **Database Integration**
   - MongoDB for persistent room/user data
   - Redis for real-time room state

3. **TURN Server**
   - Self-hosted or third-party (Xirsys, Twilio)
   - Required for restrictive networks

4. **Load Balancing**
   - Multiple signaling servers
   - Redis pub/sub for state sync

## 📄 License

MIT

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

## 📞 Support

For issues or questions, check the troubleshooting section or open a GitHub issue.

---

**Built with ❤️ using Vue 3, Express, and WebRTC**
