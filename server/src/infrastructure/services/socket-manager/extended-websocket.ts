import { WebSocket } from 'ws';

export interface ExtendedWebSocket extends WebSocket {
	id: string;
	userId: string;
	rooms: Set<string>;
}
