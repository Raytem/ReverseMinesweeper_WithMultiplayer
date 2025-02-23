import config from '../../../config/config'
import { EventBus } from '@/eventbus';
import { GameClientEvents } from '@/services/websocket/events/GameClientEvents';
import { GameServerEvents } from '@/services/websocket/events/GameServerEvents';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  isSocketConnected() {
    if (this.socket === null) {
      return false;
    }
    return !(this.socket.readyState === WebSocket.CLOSED)
  }

  disconnectSocket() {
    if (this.isSocketConnected()) {
      this.socket.close(1000, 'Closing connection normally');
      this.socket = null;
    } else {
      throw new Error('WebSocket is not initialized');
    }
  }

  joinGame(gameId) {
    if (this.socket) {
      const payload = {
        gameId,
      }
      this._sendEvent(GameClientEvents.JOIN_GAME, payload)
    }
  }

  leaveGame(gameId) {
    if (this.socket) {
      const payload = {
        gameId,
      }
      this._sendEvent(GameClientEvents.LEAVE_GAME, payload)
    }
  }

  openCell(gameId, x, y) {
    if (this.socket) {
      const payload = {
        gameId,
        x,
        y,
      }
      this._sendEvent(GameClientEvents.OPEN_CELL, payload)
    }
  }

  _sendEvent(event, data) {
    if (this.socket) {
      const message = {
        event, data
      }
      this.socket.send(JSON.stringify(message))
    }
  }

  parseIncomingEvent(data) {
    const obj = JSON.parse(data);
    return {
      event: obj?.event ?? 'unknown',
      data: obj?.data ?? undefined,
    }
  }
  
  connectSocket(userId, onConnectCallback) {
    if (this.socket) {
      return;
    }

    const connectionURL = new URL(config.wsServerBaseUrl)
    connectionURL.searchParams.set('userId', userId)

    this.socket = new WebSocket(connectionURL);
    this.userId = userId;

    this.socket.onopen = () => {
      console.debug('[WebSocketService] Connected to WebSocket server');
      if (onConnectCallback) {
        onConnectCallback();
      }
    }

    this.socket.onerror = (error) => {
      console.error('[WebSocketService] WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.debug('[WebSocketService] Disconnected from WebSocket server');
    }

    this.socket.onmessage = (messageEvent) => {
      const eventData = this.parseIncomingEvent(messageEvent.data);
      console.debug(`[WebSocketService] Handled event:\n${JSON.stringify(eventData)}`);
      if (Object.values(GameServerEvents).includes(eventData.event)) {
        EventBus.$emit(eventData.event, eventData.data);
      }
    }
  }
}

export default new WebSocketService();