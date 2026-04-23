<template>
  <div class="dashboard-container">
    <div class="header">
      <h1>🎥 Vibe Meeting</h1>
      <div class="user-info" v-if="userStore.isAuthenticated">
        <span>{{ userStore.userName }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
      <div v-else class="login-prompt">
        <p>Please log in to continue</p>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="section">
        <h2>Create New Room</h2>
        <div class="input-group">
          <input
            v-model="newRoomId"
            type="text"
            placeholder="Enter room name or ID"
            @keyup.enter="createRoom"
          />
          <button @click="createRoom" class="btn btn-primary">
            Create Room
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <h2>Join Existing Room</h2>
        <div class="input-group">
          <input
            v-model="joinRoomId"
            type="text"
            placeholder="Enter room ID to join"
            @keyup.enter="joinRoom"
          />
          <button @click="joinRoom" class="btn btn-secondary">Join Room</button>
        </div>
      </div>

      <div v-if="recentRooms.length > 0" class="section">
        <h3>Recent Rooms</h3>
        <div class="room-list">
          <div
            v-for="room in recentRooms"
            :key="room.id"
            class="room-item"
            @click="() => joinExistingRoom(room.id)"
          >
            <div class="room-name">{{ room.id }}</div>
            <div class="room-meta">{{ formatTime(room.lastAccessed) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useRoomStore } from "../stores/roomStore";

const router = useRouter();
const userStore = useUserStore();
const roomStore = useRoomStore();

const newRoomId = ref("");
const joinRoomId = ref("");
const error = ref("");
const recentRooms = ref([]);

const logout = () => {
  userStore.logout();
  error.value = "";
  router.push("/");
};

const generateRoomId = () => {
  return `room-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};

const createRoom = () => {
  error.value = "";
  const roomId = newRoomId.value.trim() || generateRoomId();

  if (!roomId) {
    error.value = "Please enter a room ID";
    return;
  }

  roomStore.setRoomId(roomId);
  router.push(`/room/${roomId}`);
};

const joinRoom = () => {
  error.value = "";
  const roomId = joinRoomId.value.trim();

  if (!roomId) {
    error.value = "Please enter a room ID";
    return;
  }

  roomStore.setRoomId(roomId);
  router.push(`/room/${roomId}`);
};

const joinExistingRoom = (roomId) => {
  roomStore.setRoomId(roomId);
  router.push(`/room/${roomId}`);
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push("/");
  }
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dashboard-content {
  flex: 1;
  padding: 3rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.section {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.section h2 {
  margin-top: 0;
  font-size: 1.3rem;
}

.section h3 {
  margin-top: 0;
  font-size: 1.1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.input-group input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #764ba2;
  color: white;
}

.btn-secondary:hover {
  background: #63408c;
  transform: translateY(-2px);
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 2rem 0;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.room-item {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.room-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.room-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.room-meta {
  font-size: 0.85rem;
  opacity: 0.8;
}

.error-message {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.4);
  color: #ffcccc;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 2rem;
}

.login-prompt {
  text-align: right;
}
</style>
