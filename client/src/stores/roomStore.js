/**
 * Room Store
 * Manages room state, room ID, and participant list
 * Persisted to localStorage
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useRoomStore = defineStore(
  "room",
  () => {
    const roomId = ref(null);
    const participants = ref(new Map());
    const isInRoom = ref(false);

    const setRoomId = (id) => {
      roomId.value = id;
    };

    const addParticipant = (socketId, userData) => {
      participants.value.set(socketId, {
        socketId,
        userId: userData.userId,
        userName: userData.userName,
        joinedAt: Date.now(),
      });
    };

    const removeParticipant = (socketId) => {
      participants.value.delete(socketId);
    };

    const getParticipant = (socketId) => {
      return participants.value.get(socketId);
    };

    const setRoomActive = (active) => {
      isInRoom.value = active;
    };

    const clearRoom = () => {
      roomId.value = null;
      participants.value.clear();
      isInRoom.value = false;
    };

    return {
      roomId,
      participants,
      isInRoom,
      setRoomId,
      addParticipant,
      removeParticipant,
      getParticipant,
      setRoomActive,
      clearRoom,
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: "vibe_room",
          storage: localStorage,
          paths: ["roomId"],
        },
      ],
    },
  },
);
