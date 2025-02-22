import config from '../../../config/config'
import io from 'socket.io-client';
import { EventBus } from '@/eventbus';
import { GameClientEvents } from '@/services/websocket/events/GameClientEvents';
import { DefaultServerEvents } from '@/services/websocket/events/DefaultServerEvents';
import { GameServerEvents } from '@/services/websocket/events/GameServerEvents';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  isSocketInitialized() {
    return this.socket !== null;
  }

  connectSocket() {
    if (this.isSocketInitialized()) {
      this.socket.connect()
    } else {
      throw new Error('WebSocket is not initialized');
    }
  }

  disconnectSocket() {
    if (this.isSocketInitialized()) {
      this.socket.disconnect();
    } else {
      throw new Error('WebSocket is not initialized');
    }
  }
  
  initializeSocket(userId) {
    if (this.socket) {
      return;
    }

    this.userId = userId;
    this.socket = io(config.wsServerBaseUrl, {
      extraHeaders: { 'x-user-id': userId }
    });

    this.socket.on('connect', () => {
      console.debug('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.debug('Disconnected from WebSocket server');
    });

    this.socket.on(GameServerEvents.GAME_STARTED, (data) => {
      console.debug('Game started:', data);
      EventBus.$emit(GameServerEvents.GAME_STARTED, data)
    });

    this.socket.on(GameServerEvents.GAME_ENDED, (data) => {
      console.debug('Game ended: ', data);
      EventBus.$emit(GameServerEvents.GAME_ENDED, data);
    });

    this.socket.on(GameServerEvents.GAME_ABORTED, (data) => {
      console.debug('Game aborted:', data);
      EventBus.$emit(GameServerEvents.GAME_ABORTED, data);
    });


    this.socket.on(GameServerEvents.PLAYER_CONNECTED, (data) => {
      console.debug('Player connected:', data);
      EventBus.$emit(GameServerEvents.PLAYER_CONNECTED, data);
    });

    this.socket.on(GameServerEvents.PLAYER_DISCONNECTED, (data) => {
      console.debug('Player disconnected:', data);
      EventBus.$emit(GameServerEvents.PLAYER_DISCONNECTED, data);
    });

    this.socket.on(GameServerEvents.CELL_RESULT, (data) => {
      console.debug('Cell result:', data);
      EventBus.$emit(GameServerEvents.CELL_RESULT, data);
    });

    this.socket.on(GameServerEvents.TURN_SWITCHED, (data) => {
      console.debug('Turn switched:', data);
      EventBus.$emit(GameServerEvents.TURN_SWITCHED, data);
    });

    this.socket.on(GameServerEvents.PLAYER_SCORE_UPDATED, (data) => {
      console.debug('Player score updating:', data);
      EventBus.$emit(GameServerEvents.PLAYER_SCORE_UPDATED, data);
    });

    this.socket.on(DefaultServerEvents.ERROR, (data) => {
      console.debug('Socket error:', data)
    })
  }

  joinGame(gameId) {
    if (this.socket) {
      const payload = {
        gameId,
      }
      this.socket.emit(GameClientEvents.JOIN_GAME, payload);
    }
  }

  leaveGame(gameId) {
    if (this.socket) {
      const payload = {
        gameId,
      }
      this.socket.emit(GameClientEvents.LEAVE_GAME, payload);
    }
  }

  openCell(gameId, x, y) {
    if (this.socket) {
      const payload = {
        gameId,
        x,
        y,
      }
      this.socket.emit(GameClientEvents.OPEN_CELL, payload);
    }
  }

  onConnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback)
    }
  }

  onDisconnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback)
    }
  }

  sendMessage(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new WebSocketService();