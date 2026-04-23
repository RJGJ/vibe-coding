/**
 * Main Express Server with Socket.io
 * Handles signaling and room management for WebRTC P2P connections
 */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import authMiddleware from "./middleware/auth.js";
import roomManager from "./utils/roomManager.js";
import { verifyGoogleToken, generateToken } from "./utils/auth.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

/**
 * POST /auth/verify - Verify Google OAuth token and issue JWT
 */
app.post("/auth/verify", async (req, res) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    return res.status(400).json({ error: "No Google token provided" });
  }

  const result = await verifyGoogleToken(googleToken);

  if (!result.success) {
    return res.status(401).json({ error: "Invalid Google token" });
  }

  const token = generateToken({
    userId: result.userId,
    userName: result.userName,
    email: result.email,
  });

  res.json({
    success: true,
    token,
    user: {
      userId: result.userId,
      userName: result.userName,
      email: result.email,
    },
  });
});

/**
 * GET /auth/user - Get current user (protected)
 */
app.get("/auth/user", authMiddleware, (req, res) => {
  res.json({ user: req.userData });
});

/**
 * GET /rooms/:roomId - Check if room is active
 */
app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const isActive = roomManager.isRoomActive(roomId);
  const participants = isActive ? roomManager.getRoomParticipants(roomId) : [];

  res.json({
    isActive,
    participantCount: participants.length,
    participants: participants.map((p) => ({
      userId: p.userId,
      userName: p.userName,
    })),
  });
});

/**
 * GET /rooms - List all active rooms (protected)
 */
app.get("/rooms", authMiddleware, (req, res) => {
  const rooms = roomManager.getAllRooms();
  res.json({
    rooms: rooms.map((r) => ({
      id: r.id,
      participantCount: r.participants.size,
      createdAt: r.createdAt,
    })),
  });
});

// Socket.io Events

/**
 * Handle socket connection and room/peer management
 */
io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  /**
   * join-room: User joins a room and initiates signaling
   */
  socket.on("join-room", (data) => {
    const { roomId, userId, userName } = data;

    socket.join(roomId);
    roomManager.addParticipant(roomId, socket.id, { userId, userName });

    // Notify others in room that a new peer joined
    socket.to(roomId).emit("peer-joined", {
      socketId: socket.id,
      userId,
      userName,
    });

    // Send existing participants to the new joiner
    const participants = roomManager.getRoomParticipants(roomId);
    const otherParticipants = participants.filter(
      (p) => p.socketId !== socket.id,
    );

    socket.emit("room-peers", {
      peers: otherParticipants.map((p) => ({
        socketId: p.socketId,
        userId: p.userId,
        userName: p.userName,
      })),
    });

    console.log(
      `[Room ${roomId}] ${userName} joined. Total participants: ${participants.length}`,
    );
  });

  /**
   * offer: Forward WebRTC offer from sender to receiver
   */
  socket.on("offer", (data) => {
    const { to, offer, from } = data;
    io.to(to).emit("offer", {
      from,
      offer,
    });
    console.log(`[WebRTC] Offer sent from ${from} to ${to}`);
  });

  /**
   * answer: Forward WebRTC answer from receiver to sender
   */
  socket.on("answer", (data) => {
    const { to, answer, from } = data;
    io.to(to).emit("answer", {
      from,
      answer,
    });
    console.log(`[WebRTC] Answer sent from ${from} to ${to}`);
  });

  /**
   * ice-candidate: Forward ICE candidate between peers
   */
  socket.on("ice-candidate", (data) => {
    const { to, candidate, from } = data;
    io.to(to).emit("ice-candidate", {
      from,
      candidate,
    });
  });

  /**
   * Handle disconnection and room cleanup
   */
  socket.on("disconnect", () => {
    // Find which rooms this socket was in
    const rooms = Array.from(socket.rooms);

    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        const room = roomManager.removeParticipant(roomId, socket.id);

        // Notify remaining peers that someone left
        socket.to(roomId).emit("peer-left", {
          socketId: socket.id,
        });

        if (room === null) {
          console.log(`[Room ${roomId}] Deleted (no participants)`);
        } else {
          console.log(
            `[Room ${roomId}] Participant removed. Remaining: ${room.participants.size}`,
          );
        }
      }
    });

    console.log(`[Socket] Disconnected: ${socket.id}`);
  });

  /**
   * Handle socket errors
   */
  socket.on("error", (error) => {
    console.error(`[Socket Error] ${socket.id}:`, error);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Vibe Meeting Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(
    `🔐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}\n`,
  );
});

export default httpServer;
