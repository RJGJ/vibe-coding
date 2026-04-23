## 🎥 Vibe Meeting MVP - Setup & Quick Start Guide

### Prerequisites

- Node.js 16+ and npm
- Microphone and camera
- Modern browser (Chrome, Firefox, Safari, Edge)

### 1️⃣ One-Command Setup (Recommended)

```bash
bash setup.sh
```

This will install all dependencies for both backend and frontend.

### 2️⃣ Manual Setup

#### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:3001
```

#### Frontend (in new terminal)

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3️⃣ Test the Application

1. **Open browser**: http://localhost:5173
2. **Enter any username**: e.g., "Alice" (no real auth in MVP)
3. **Create room**: Click "Create Room" or generate new room ID
4. **Get room ID**: Copy the generated room ID (e.g., "room-abc123...")
5. **Open second window**: Open another browser or private window
6. **Join same room**: Enter the same room ID from step 4
7. **Grant permissions**: Allow camera/microphone in both windows
8. **See magic happen** ✨: Both windows should show video streams

### 4️⃣ Key Features to Test

- **Video Sync**: Both windows show each other's video
- **Mute Button** 🎤: Click to toggle audio
- **Video Button** 📹: Click to toggle camera
- **Multiple Peers**: Open more windows to add more participants
- **Disconnect**: Click "Leave" and see the other peer notified
- **Refresh Test**: Refresh the page - room ID persists (Pinia + localStorage)

### 5️⃣ Troubleshooting

**"Can't access camera"**

- Check browser permissions
- Try a different browser
- Restart browser

**"Socket connection refused"**

- Ensure backend is running on port 3001
- Check no other service uses port 3001
- Restart backend

**"Video black screen"**

- Confirm camera works outside browser
- Check browser console (F12) for errors
- Try different camera device

**"Peer doesn't see my video"**

- Open browser console to check errors
- Verify both peers joined same room ID
- Check firewall/NAT (STUN should help)

### 6️⃣ Project Structure

```
vibe-coding/
├── server/              # Express backend
│   ├── src/
│   │   ├── server.js    # Main server + Socket.io
│   │   ├── middleware/  # Auth middleware
│   │   └── utils/       # Room manager, auth utils
│   └── package.json
│
├── client/              # Vue 3 frontend
│   ├── src/
│   │   ├── components/  # Login, Dashboard, VideoGrid
│   │   ├── stores/      # Pinia stores (user, room, webrtc)
│   │   ├── utils/       # WebRTC, Socket.io helpers
│   │   └── main.js      # App initialization
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md            # Full documentation
└── setup.sh             # This setup script
```

### 7️⃣ File Reference

| File                                  | Purpose                                |
| ------------------------------------- | -------------------------------------- |
| `server/src/server.js`                | Main server + Socket.io event handlers |
| `server/src/utils/roomManager.js`     | Room & participant tracking            |
| `client/src/components/VideoGrid.vue` | Main video conference UI               |
| `client/src/stores/userStore.js`      | User state + persistence               |
| `client/src/stores/webrtcStore.js`    | Peer connections & media state         |
| `client/src/utils/webrtc.js`          | RTCPeerConnection wrapper              |

### 8️⃣ Key Technologies

- **Vue 3**: Reactive UI components
- **Pinia**: State management with persistence
- **Socket.io**: Real-time signaling
- **WebRTC**: Peer-to-peer video/audio
- **Express**: HTTP + WebSocket server
- **Vite**: Lightning-fast dev server

### 9️⃣ What Happens Behind the Scenes

1. **User Login**: Creates persistent user ID
2. **Room Create/Join**: Persists room ID locally
3. **Socket Connection**: Connects to signaling server
4. **Media Setup**: Requests camera/microphone access
5. **Peer Discovery**: Gets list of existing peers
6. **Offer/Answer**: WebRTC handshake for each peer
7. **ICE Candidates**: Exchanges network info (via STUN)
8. **Stream Exchange**: Direct P2P media flow
9. **Mute/Video**: Disables track locally & notifies others
10. **Disconnect**: Closes connections & cleans up memory

### 🔟 Architecture Diagram

```
┌─────────────────────────────────────────────┐
│            Browser A (User 1)               │
│  ┌───────────────────────────────────────┐  │
│  │  Vue App (Login → Dashboard → Video) │  │
│  │  ├─ Pinia Stores (persistent)        │  │
│  │  ├─ Socket.io Client                 │  │
│  │  └─ WebRTC PeerConnections (n-1)     │  │
│  └───────────────────────────────────────┘  │
│           │                    │             │
│  Camera/Mic Capture    Signaling & Media    │
└─────────────────────────────────────────────┘
            ↓                    ↓
         [WebRTC P2P]      [Socket.io WebSocket]
            ↓                    ↓
     ┌─────────────────────────────────────┐
     │   Express + Socket.io Server        │
     │   ├─ Room Manager (in-memory)      │
     │   ├─ Signaling (offer/answer/ICE)  │
     │   ├─ Auth Middleware               │
     │   └─ CORS & Error Handling         │
     └─────────────────────────────────────┘
            ↑                    ↑
     ┌─────────────────────────────────────┐
     │   Browser B (User 2)               │
     │   ├─ Same architecture             │
     │   └─ Sends offers, receives answers│
     └─────────────────────────────────────┘
```

### 1️⃣1️⃣ Environment Variables

**Backend (.env in server/)**

```
PORT=3001                    # Server port
NODE_ENV=development         # dev or production
CLIENT_URL=http://localhost:5173  # Frontend URL
GOOGLE_CLIENT_ID=xxx         # Optional: Google OAuth
GOOGLE_CLIENT_SECRET=xxx     # Optional: Google OAuth
```

### 1️⃣2️⃣ Performance Tips

- **Close other apps**: Frees up CPU for video encoding
- **Use wired connection**: More stable than WiFi
- **Optimal participant count**: 3-6 peers per mesh
- **Monitor WebRTC stats**: `chrome://webrtc-internals`

### 1️⃣3️⃣ Next Level: Production Deployment

1. **Security**: Add real Google OAuth
2. **Scale**: Implement SFU (Selective Forwarding Unit)
3. **Database**: Add MongoDB for room persistence
4. **TURN Servers**: Required for restrictive networks
5. **HTTPS**: Required for production
6. **CDN**: Serve frontend from edge
7. **Docker**: Containerize for deployment

### 1️⃣4️⃣ Resources

- [WebRTC Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Guide](https://socket.io/docs/)
- [Vue 3 Guide](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)

---

**Ready to use!** Start from step 1️⃣ and you'll have a working video conference in minutes. 🎉
