<template>
  <div class="video-grid-container">
    <div class="header">
      <h2>{{ roomStore.roomId }}</h2>
      <div class="controls">
        <button
          @click="toggleAudio"
          class="control-btn"
          :class="{ disabled: !webrtcStore.isAudioEnabled }"
        >
          {{ webrtcStore.isAudioEnabled ? "🎤" : "🔇" }}
        </button>
        <button
          @click="toggleVideo"
          class="control-btn"
          :class="{ disabled: !webrtcStore.isVideoEnabled }"
        >
          {{ webrtcStore.isVideoEnabled ? "📹" : "⛔" }}
        </button>
        <button @click="leaveRoom" class="control-btn btn-danger">Leave</button>
      </div>
    </div>

    <div class="video-grid">
      <!-- Local video -->
      <div class="video-card local">
        <video ref="localVideoRef" autoplay muted playsinline></video>
        <div class="label">You ({{ userStore.userName }})</div>
      </div>

      <!-- Remote videos -->
      <div
        v-for="(stream, socketId) in webrtcStore.peerStreams"
        :key="socketId"
        class="video-card remote"
      >
        <video
          :ref="(el) => (remoteVideoRefs[socketId] = el)"
          autoplay
          playsinline
        ></video>
        <div class="label">{{ getPeerName(socketId) }}</div>
      </div>
    </div>

    <div v-if="connectionStatus" class="status-bar" :class="connectionStatus">
      {{ connectionStatus }}
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useRoomStore } from "../stores/roomStore";
import { useWebRTCStore } from "../stores/webrtcStore";
import { getSocket, initializeSocket, closeSocket } from "../utils/socket";
import { WebRTCManager, getLocalStream } from "../utils/webrtc";

const router = useRouter();
const userStore = useUserStore();
const roomStore = useRoomStore();
const webrtcStore = useWebRTCStore();

const localVideoRef = ref(null);
const remoteVideoRefs = ref({});
const error = ref("");
const connectionStatus = ref("");
const peerManagers = ref(new Map());
const socket = ref(null);

const getPeerName = (socketId) => {
  const participant = roomStore.participants.get(socketId);
  return participant?.userName || "Unknown";
};

const setupLocalStream = async () => {
  try {
    const stream = await getLocalStream();
    webrtcStore.setLocalStream(stream);

    if (localVideoRef.value) {
      localVideoRef.value.srcObject = stream;
    }

    connectionStatus.value = "local-ready";
  } catch (err) {
    error.value = `Failed to access camera/microphone: ${err.message}`;
    connectionStatus.value = "local-failed";
    console.error("Error getting local stream:", err);
  }
};

const createPeerConnection = async (socketId) => {
  try {
    const manager = new WebRTCManager(webrtcStore.RTCConfig);
    await manager.createPeerConnection();

    if (webrtcStore.localStream) {
      await manager.addLocalStreamToPeer(webrtcStore.localStream);
    }

    // Handle ICE candidates
    manager.onIceCandidate((candidate) => {
      socket.value?.emit("ice-candidate", {
        to: socketId,
        from: socket.value.id,
        candidate: candidate.toJSON(),
      });
    });

    // Handle remote stream
    manager.onTrack((remoteStream) => {
      webrtcStore.addPeerStream(socketId, remoteStream);

      // Update video element in next tick
      setTimeout(() => {
        if (remoteVideoRefs.value[socketId]) {
          remoteVideoRefs.value[socketId].srcObject = remoteStream;
        }
      }, 0);
    });

    // Handle connection state changes
    manager.onConnectionStateChange((state) => {
      console.log(`[WebRTC] Connection state with ${socketId}: ${state}`);
      if (state === "failed" || state === "disconnected") {
        disconnectPeer(socketId);
      }
    });

    webrtcStore.addPeerConnection(socketId, manager.peerConnection);
    peerManagers.value.set(socketId, manager);

    return manager;
  } catch (err) {
    error.value = `Failed to create peer connection: ${err.message}`;
    console.error("Error creating peer connection:", err);
  }
};

const initiateOffer = async (socketId) => {
  try {
    const manager = peerManagers.value.get(socketId);
    if (!manager) {
      console.error("Manager not found for", socketId);
      return;
    }

    const offer = await manager.createOffer();
    socket.value?.emit("offer", {
      to: socketId,
      from: socket.value.id,
      offer: offer.toJSON(),
    });

    console.log(`[WebRTC] Offer sent to ${socketId}`);
  } catch (err) {
    error.value = `Failed to create offer: ${err.message}`;
    console.error("Error creating offer:", err);
  }
};

const disconnectPeer = (socketId) => {
  webrtcStore.removePeerConnection(socketId);
  webrtcStore.removePeerStream(socketId);
  peerManagers.value.delete(socketId);
  roomStore.removeParticipant(socketId);
  delete remoteVideoRefs.value[socketId];
};

const toggleAudio = () => {
  webrtcStore.toggleAudio();
};

const toggleVideo = () => {
  webrtcStore.toggleVideo();
};

const leaveRoom = () => {
  cleanup();
  router.push("/dashboard");
};

const cleanup = () => {
  // Stop local stream
  webrtcStore.stopAllTracks();

  // Close all peer connections
  webrtcStore.closeAllConnections();

  // Leave socket room
  socket.value?.emit("leave-room", { roomId: roomStore.roomId });

  // Close socket
  closeSocket();

  // Clear store
  roomStore.clearRoom();
  peerManagers.value.clear();
};

onMounted(async () => {
  if (!userStore.isAuthenticated || !roomStore.roomId) {
    router.push("/dashboard");
    return;
  }

  // Initialize socket
  socket.value = initializeSocket("http://localhost:3001");

  // Listen for room events
  socket.value.on("room-peers", (data) => {
    console.log("[Room] Existing peers:", data.peers);

    data.peers.forEach((peer) => {
      roomStore.addParticipant(peer.socketId, {
        userId: peer.userId,
        userName: peer.userName,
      });
    });

    // Create peer connections for all existing peers
    data.peers.forEach((peer) => {
      createPeerConnection(peer.socketId).then(() => {
        initiateOffer(peer.socketId);
      });
    });
  });

  socket.value.on("peer-joined", async (data) => {
    console.log("[Room] Peer joined:", data);
    roomStore.addParticipant(data.socketId, {
      userId: data.userId,
      userName: data.userName,
    });

    // Create peer connection for new peer
    await createPeerConnection(data.socketId);
    // Wait for remote peer to send offer (they are the caller)
  });

  socket.value.on("offer", async (data) => {
    console.log("[WebRTC] Received offer from", data.from);

    let manager = peerManagers.value.get(data.from);
    if (!manager) {
      manager = await createPeerConnection(data.from);
    }

    try {
      await manager.setRemoteDescription(data.offer);
      const answer = await manager.createAnswer();
      socket.value?.emit("answer", {
        to: data.from,
        from: socket.value.id,
        answer: answer.toJSON(),
      });
      console.log(`[WebRTC] Answer sent to ${data.from}`);
    } catch (err) {
      error.value = `Failed to handle offer: ${err.message}`;
      console.error("Error handling offer:", err);
    }
  });

  socket.value.on("answer", async (data) => {
    console.log("[WebRTC] Received answer from", data.from);

    const manager = peerManagers.value.get(data.from);
    if (manager) {
      try {
        await manager.setRemoteDescription(data.answer);
        console.log(`[WebRTC] Remote description set from ${data.from}`);
      } catch (err) {
        error.value = `Failed to handle answer: ${err.message}`;
        console.error("Error handling answer:", err);
      }
    }
  });

  socket.value.on("ice-candidate", async (data) => {
    const manager = peerManagers.value.get(data.from);
    if (manager && data.candidate) {
      try {
        await manager.addIceCandidate(data.candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  });

  socket.value.on("peer-left", (data) => {
    console.log("[Room] Peer left:", data.socketId);
    disconnectPeer(data.socketId);
  });

  // Setup local stream
  await setupLocalStream();

  // Join room
  socket.value.emit("join-room", {
    roomId: roomStore.roomId,
    userId: userStore.userId,
    userName: userStore.userName,
  });

  connectionStatus.value = "joining-room";
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
.video-grid-container {
  height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h2 {
  margin: 0;
  color: white;
  font-size: 1.3rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.control-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.disabled {
  opacity: 0.5;
}

.btn-danger {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.3);
}

.btn-danger:hover {
  background: rgba(255, 0, 0, 0.3);
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  overflow-y: auto;
}

.video-card {
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.video-card.local {
  border: 2px solid #667eea;
}

.video-card.remote {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.label {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-bar {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.75rem 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-bar.local-ready {
  color: #4ade80;
}

.status-bar.local-failed {
  color: #ef4444;
}

.status-bar.joining-room {
  color: #60a5fa;
}

.error-message {
  background: rgba(255, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 0, 0, 0.3);
  color: #ffcccc;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
