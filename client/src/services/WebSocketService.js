import config from '../../config/config'
import io from 'socket.io-client';
import { EventBus } from '@/eventbus';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  // Инициализация сокета с serverBaseUrl и userId
  initializeSocket(userId) {
    if (this.socket) {
      return;
    }

    this.userId = userId;
    this.socket = io(config.wsServerBaseUrl, {
      extraHeaders: { 'x-user-id': userId }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('game-started', (data) => {
      console.log('Game started:', data);
      EventBus.$emit('game-started', data)
    });

    this.socket.on('game-ended', (data) => {
      console.log('Game ended: ', data);
      EventBus.$emit('game-ended', data);
    });

    this.socket.on('game-aborted', (data) => {
      console.log('Game aborted:', data);
      EventBus.$emit('game-aborted', data);
    });


    this.socket.on('player-connected', (data) => {
      console.log('Player connected:', data);
      EventBus.$emit('player-connected', data);
    });

    this.socket.on('player-disconnected', (data) => {
      console.log('Player disconnected:', data);
      EventBus.$emit('player-disconnected', data);
    });

    this.socket.on('cell-result', (data) => {
      console.log('Cell result:', data);
      EventBus.$emit('cell-result', data);
    });

    this.socket.on('turn-switched', (data) => {
      console.log('Turn switched:', data);
      EventBus.$emit('turn-switched', data);
    });

    this.socket.on('player-score-updating', (data) => {
      console.log('Player score updating:', data);
      EventBus.$emit('player-score-updating', data);
    });

    this.socket.on('err', (data) => {
      console.log('Socket error:', data)
    })
  }

  // Подключение к определённой комнате
  joinGame(gameId) {
    if (this.socket) {
      this.socket.emit('join-game', {
        gameId,
      });
    }
  }

  leaveGame(gameId) {
    if (this.socket) {
      this.socket.emit('leave-game', {
        gameId,
      });
    }
  }

  openCell(gameId, x, y) {
    if (this.socket) {
      this.socket.emit('open-cell', {
        gameId,
        x,
        y,
      });
    }
  }

  // Отправка сообщений
  sendMessage(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Получение сообщений
  onMessage(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Отключение сокета
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new WebSocketService();