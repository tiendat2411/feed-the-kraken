import { io } from 'socket.io-client';
import { randomUUID } from 'crypto';
import { AutoResponder } from './AutoResponder.js';

const AVATAR_POOL = ['🤖', '🏴‍☠️', '⚓', '🐙', '🦜', '🧜‍♂️', '🧑‍✈️', '👩‍🔧', '👨‍🍳', '🥷'];

export class BotClient {
  /**
   * Khởi tạo một instance Bot ảo độc lập
   * @param {Object} options
   * @param {number} options.index - Thứ tự của bot trong sandbox (1..N)
   * @param {string} [options.nickname] - Tên hiển thị (mặc định: Bot_{index})
   * @param {string} [options.avatar] - Avatar emoji
   * @param {string} [options.serverUrl] - URL máy chủ backend WebSocket
   */
  constructor({ index, nickname, avatar, serverUrl = 'http://localhost:3001' } = {}) {
    this.index = index || 1;
    this.nickname = nickname || `Bot_${this.index}`;
    this.avatar = avatar || AVATAR_POOL[(this.index - 1) % AVATAR_POOL.length];
    this.serverUrl = serverUrl;
    
    // In-memory unique session token (Bypass LocalStorage)
    this.sessionToken = `bot_session_${randomUUID()}`;
    
    this.id = null;
    this.roomId = null;
    this.isHost = false;
    this.secretRole = null;
    this.guns = 3;
    this.publicTitles = [];
    this.knownPirates = [];
    this.autoMode = true;
    
    this.socket = null;
    this.currentRoomState = null;
    this.onStateChangeCallback = null;
  }

  /**
   * Kết nối WebSocket tới Server backend
   * @returns {Promise<BotClient>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        auth: {
          token: this.sessionToken,
          sessionToken: this.sessionToken
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        resolve(this);
      });

      this.socket.on('connect_error', (err) => {
        reject(err);
      });

      // Lắng nghe cập nhật trạng thái phòng từ server
      this.socket.on('room_state', (roomState) => {
        this.currentRoomState = roomState;
        this.roomId = roomState.id;
        
        if (roomState.myRole) {
          this.secretRole = roomState.myRole;
        }
        if (roomState.knownPirates) {
          this.knownPirates = roomState.knownPirates;
        }
        if (roomState.myId) {
          this.id = roomState.myId;
        }

        const me = roomState.players?.find(p => p.id === this.id || p.nickname === this.nickname);
        if (me) {
          this.id = me.id;
          this.isHost = (roomState.hostId === me.id);
          this.guns = me.guns ?? this.guns;
          this.publicTitles = me.publicTitles || [];
        }

        if (typeof this.onStateChangeCallback === 'function') {
          this.onStateChangeCallback(roomState);
        }

        // Tự động kiểm tra trigger theo gamePhase nếu cần
        if (roomState.gamePhase === 'MUTINY_VOTING') {
          AutoResponder.dispatch(this, 'REQUIRE_VOTE', roomState);
        }
      });

      // Lắng nghe nhận vai trò ẩn riêng tư
      this.socket.on('ROLE_ASSIGNED', ({ role }) => {
        this.secretRole = role;
      });

      // Các sự kiện yêu cầu hành động từ Server
      this.socket.on('REQUIRE_VOTE', (payload) => AutoResponder.dispatch(this, 'REQUIRE_VOTE', payload));
      this.socket.on('MUTINY_VOTING_STARTED', (payload) => AutoResponder.dispatch(this, 'REQUIRE_VOTE', payload));
      this.socket.on('REQUIRE_TEAM_APPOINTMENT', (payload) => AutoResponder.dispatch(this, 'REQUIRE_TEAM_APPOINTMENT', payload));
      this.socket.on('REQUIRE_CARD_DISCARD', (payload) => AutoResponder.dispatch(this, 'REQUIRE_CARD_DISCARD', payload));
      this.socket.on('REQUIRE_NAVIGATION_SELECTION', (payload) => AutoResponder.dispatch(this, 'REQUIRE_NAVIGATION_SELECTION', payload));
      this.socket.on('REQUIRE_CULT_CONVERSION', (payload) => AutoResponder.dispatch(this, 'REQUIRE_CULT_CONVERSION', payload));

      this.socket.on('ROOM_DISSOLVED', () => {
        this.roomId = null;
        this.currentRoomState = null;
      });

      this.socket.on('PLAYER_KICKED', () => {
        this.roomId = null;
        this.currentRoomState = null;
      });
    });
  }

  /**
   * Tham gia vào phòng chơi mục tiêu
   * @param {string} roomId 
   * @returns {Promise<Object>}
   */
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        return reject(new Error('Socket chưa được kết nối tới Server'));
      }

      this.socket.emit('join_room', {
        roomId,
        nickname: this.nickname,
        avatar: this.avatar
      }, (response) => {
        if (response && response.success) {
          this.roomId = roomId;
          if (response.room) {
            this.currentRoomState = response.room;
            if (response.room.myRole) this.secretRole = response.room.myRole;
            if (response.room.myId) this.id = response.room.myId;
          }
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Không thể tham gia phòng'));
        }
      });
    });
  }

  /**
   * Tự động tạo một phòng mới (đóng vai trò Host)
   * @param {string} [mapType='QUICK_JOURNEY']
   * @returns {Promise<Object>}
   */
  createRoom(mapType = 'QUICK_JOURNEY') {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        return reject(new Error('Socket chưa được kết nối tới Server'));
      }

      this.socket.emit('create_room', {
        nickname: this.nickname,
        avatar: this.avatar,
        mapType
      }, (response) => {
        if (response && response.success) {
          this.roomId = response.room?.id;
          this.isHost = true;
          this.currentRoomState = response.room;
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Không thể tạo phòng'));
        }
      });
    });
  }

  /**
   * Rời phòng an toàn (Graceful leave)
   */
  leaveRoom() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room');
      this.roomId = null;
      this.currentRoomState = null;
    }
  }

  /**
   * Ngắt kết nối socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Lấy thông tin tóm tắt trạng thái của Bot
   * @returns {Object}
   */
  getStatus() {
    return {
      index: this.index,
      nickname: this.nickname,
      avatar: this.avatar,
      id: this.id || 'N/A',
      socketId: this.socket?.id || 'offline',
      connected: this.socket?.connected || false,
      isHost: this.isHost,
      secretRole: this.secretRole || 'UNKNOWN',
      guns: this.guns,
      titles: this.publicTitles.join(', ') || '-',
      autoMode: this.autoMode ? 'ON' : 'OFF'
    };
  }
}

export default BotClient;
