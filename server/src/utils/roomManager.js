/**
 * Room Management Utility
 * Handles active rooms and participant tracking
 */

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: new Map(),
        createdAt: Date.now(),
      });
    }
    return this.rooms.get(roomId);
  }

  addParticipant(roomId, socketId, userData) {
    const room = this.createRoom(roomId);
    room.participants.set(socketId, {
      socketId,
      userId: userData.userId,
      userName: userData.userName,
      joinedAt: Date.now(),
    });
    return room;
  }

  removeParticipant(roomId, socketId) {
    if (!this.rooms.has(roomId)) return null;

    const room = this.rooms.get(roomId);
    room.participants.delete(socketId);

    // Delete room if no participants left
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      return null;
    }
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  getRoomParticipants(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }

  isRoomActive(roomId) {
    return this.rooms.has(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

export default new RoomManager();
