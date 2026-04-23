/**
 * WebRTC Utilities
 * Handles peer connection setup and management
 */

export class WebRTCManager {
  constructor(config) {
    this.RTCConfig = config;
    this.peerConnection = null;
  }

  async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.RTCConfig);
    return this.peerConnection;
  }

  async addLocalStreamToPeer(stream) {
    if (!this.peerConnection) {
      await this.createPeerConnection();
    }

    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });
  }

  async createOffer() {
    if (!this.peerConnection) {
      await this.createPeerConnection();
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer() {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(description) {
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(description),
      );
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (candidate) {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  getLocalDescription() {
    return this.peerConnection?.localDescription;
  }

  onIceCandidate(callback) {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        callback(event.candidate);
      }
    };
  }

  onTrack(callback) {
    this.peerConnection.ontrack = (event) => {
      callback(event.streams[0]);
    };
  }

  onConnectionStateChange(callback) {
    this.peerConnection.onconnectionstatechange = () => {
      callback(this.peerConnection.connectionState);
    };
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}

/**
 * Get local media stream
 */
export async function getLocalStream(
  constraints = {
    audio: true,
    video: { width: 1280, height: 720 },
  },
) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error("Error getting local stream:", error);
    throw error;
  }
}
