import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { ExtendedWebSocket } from '@infrastructure/services/socket-manager/extended-websocket';

@Injectable()
export class SocketManagerService {
	/**
	 * Data structures:
	 * - sockets: Map<socketId, WebSocket>
	 * - userSockets: Map<userId, Set<socketId>>
	 * - rooms: Map<roomId, Set<socketId>>
	 */
	private sockets: Map<string, ExtendedWebSocket> = new Map();
	private userSockets: Map<string, Set<string>> = new Map();
	private rooms: Map<string, Set<string>> = new Map();

	addSocket(socket: WebSocket, userId: string) {
		const socketId = randomUUID();

		const extendedSocket = socket as ExtendedWebSocket;
		extendedSocket.id = socketId;
		extendedSocket.userId = userId;
		extendedSocket.rooms = new Set();

		this.sockets.set(socketId, extendedSocket)

		if (!this.userSockets.has(userId)) {
			this.userSockets.set(userId, new Set());
		}
		this.userSockets.get(userId)!.add(socketId);
	}

	disconnect(socketId: string) {
		this.rooms.forEach((sockets, roomId) => {
			if (sockets.has(socketId)) {
				sockets.delete(socketId);
				if (sockets.size === 0) {
					this.rooms.delete(roomId);
				}
			}
		});

		for (const [userId, socketSet] of this.userSockets.entries()) {
			if (socketSet.has(socketId)) {
				socketSet.delete(socketId);
				if (socketSet.size === 0) {
					this.userSockets.delete(userId);
				}
				break;
			}
		}

		this.sockets.delete(socketId);
	}

	addToRoom(roomId: string, socketId: string) {
		if (this.sockets.has(socketId)) {
			if (!this.rooms.has(roomId)) {
				this.rooms.set(roomId, new Set());
			}
			this.rooms.get(roomId)!.add(socketId);
			this.sockets.get(socketId)!.rooms.add(roomId)
		}
	}

	leaveRoom(roomId: string, socketId: string) {
		if (this.sockets.has(socketId)) {
			const roomSockets = this.rooms.get(roomId);
			if (roomSockets) {
				roomSockets.delete(socketId)
				this.sockets.get(socketId)!.rooms.delete(roomId)

				if (roomSockets.size === 0) {
					this.rooms.delete(roomId);
				}
			}
		}
	}

	broadcastToRoom(roomId: string, event: string, data: any) {
		const roomSockets = this.rooms.get(roomId)
		if (roomSockets) {
			roomSockets.forEach((socketId) => this.sendToSocket(socketId, event, data));
		}
	}

	sendToUser(userId: string, event: string, data: any) {
		const socketSet = this.userSockets.get(userId);
		if (socketSet) {
			socketSet.forEach((socketId) => this.sendToSocket(socketId, event, data));
		}
	}

	sendToSocket(socketId: string, event: string, data: any) {
		const socket = this.sockets.get(socketId);
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ event, data }));
		}
	}
}