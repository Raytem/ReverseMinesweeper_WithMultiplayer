import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { GameStartedEvent } from '@domain/event-emitter-events/game-started.event';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io'
import * as console from 'node:console';
import { BadRequestException, Logger, UseFilters } from '@nestjs/common';
import { GameAggregate } from '@domain/entities/game/game.aggregate';
import config from '@infrastructure/config/configuration'
import { AllExceptionsFilter } from '@infrastructure/common/exception-filters/all-exception.filter';
import { GameClientEvents } from '@infrastructure/common/enums/ws-events/game-client-events.enum';

type SocketWithUserId = Socket & { userId: string }

@WebSocketGateway(config().app.ws.port, { transports: ['websocket'] })
@UseFilters(AllExceptionsFilter)
export class GameWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	//@ts-ignore
	private readonly server: Server
	private readonly  logger = new Logger(GameWebSocketGateway.name);

	constructor() {
	}

	handleConnection(client: SocketWithUserId): any {
		this.logger.log(`Client connected: ${client.id}`);
		const game = new GameAggregate('1123213', 6, 3);
		game.openCell('234', 3, 4)
		console.log(this.server.sockets.name)
	}

	handleDisconnect(client: SocketWithUserId): any {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage(GameClientEvents.OPEN_CELL)
	handle() {
		throw new BadRequestException('some error')
	}

	@OnEvent(GameStartedEvent.name)
	handleGameStartedEvent(event: GameStartedEvent) {
		console.log('Event: ', GameStartedEvent.name, event)
	}
}