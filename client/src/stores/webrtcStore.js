/**
 * WebRTC Store
 * Manages peer connections and local media state
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWebRTCStore = defineStore("webrtc", () => {
  const peerConnections = ref(new Map());
  const localStream = ref(null);
  const isAudioEnabled = ref(true);
  const isVideoEnabled = ref(true);
  const peerStreams = ref(new Map()); // Map<socketId, MediaStream>

  const STUN_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ];

  const RTCConfig = {
    iceServers: STUN_SERVERS,
  };

  const addPeerConnection = (socketId, peerConnection) => {
    peerConnections.value.set(socketId, peerConnection);
  };

  const getPeerConnection = (socketId) => {
    return peerConnections.value.get(socketId);
  };

  const removePeerConnection = (socketId) => {
    const pc = peerConnections.value.get(socketId);
    if (pc) {
      pc.close();
      peerConnections.value.delete(socketId);
    }
  };

  const setLocalStream = (stream) => {
    localStream.value = stream;
  };

  const addPeerStream = (socketId, stream) => {
    peerStreams.value.set(socketId, stream);
  };

  const getPeerStream = (socketId) => {
    return peerStreams.value.get(socketId);
  };

  const removePeerStream = (socketId) => {
    peerStreams.value.delete(socketId);
  };

  const toggleAudio = () => {
    if (localStream.value) {
      localStream.value.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled.value;
      });
      isAudioEnabled.value = !isAudioEnabled.value;
    }
  };

  const toggleVideo = () => {
    if (localStream.value) {
      localStream.value.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled.value;
      });
      isVideoEnabled.value = !isVideoEnabled.value;
    }
  };

  const stopAllTracks = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop());
      localStream.value = null;
    }
  };

  const closeAllConnections = () => {
    peerConnections.value.forEach((pc) => pc.close());
    peerConnections.value.clear();
    peerStreams.value.clear();
  };

  return {
    peerConnections,
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    peerStreams,
    RTCConfig,
    addPeerConnection,
    getPeerConnection,
    removePeerConnection,
    setLocalStream,
    addPeerStream,
    getPeerStream,
    removePeerStream,
    toggleAudio,
    toggleVideo,
    stopAllTracks,
    closeAllConnections,
  };
});
