import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { IncomingMessage } from 'http';

import config from '@infrastructure/config/configuration';
import { AllExceptionsFilter } from '@infrastructure/common/exception-filters/all-exception.filter';
import { DefaultServerEvents } from '@infrastructure/common/enums/ws-events/default-server-events.enum';
import { ExceptionResponseDto } from '@infrastructure/common/shared/responses/exception.response';
import { GameClientEvents } from '@infrastructure/common/enums/ws-events/game-client-events.enum';
import { JoinGameUseCase, LeaveGameUseCase, OpenCellUseCase } from '@usecases/game';
import {
	GameStartedEvent,
	GameEndedEvent,
	GameAbortedEvent,
	PlayerConnectedEvent,
	PlayerDisconnectedEvent,
	CellResultEvent,
	TurnSwitchedEvent,
	PlayerScoreUpdatedEvent,
} from '@domain/event-emitter-events';
import { JoinGameDto, LeaveGameDto, OpenCellDto } from '@infrastructure/transports/game/websocket/dto';
import {
	CellResultResponse,
	GameAbortedResponse,
	GameEndedResponse,
	PlayerConnectedResponse,
} from '@infrastructure/transports/game/websocket/responses';
import { SocketManagerService, ExtendedWebSocket } from '@infrastructure/services/socket-manager';
import { GameServerEvents } from '@infrastructure/common/enums/ws-events/game-server-events.enum';


const USER_ID_QUERY_PARAM = 'userId';


@WebSocketGateway(config().app.ws.port, { cors: true, transports: ['websocket'] })
@UseFilters(AllExceptionsFilter)
@UsePipes(new ValidationPipe())
export class GameWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(GameWebSocketGateway.name);

	constructor(
		private readonly socketManager: SocketManagerService,
		private readonly joinGameUseCase: JoinGameUseCase,
		private readonly leaveGameUseCase: LeaveGameUseCase,
		private readonly openCellUseCase: OpenCellUseCase
	) {}

	async handleConnection(client: ExtendedWebSocket, request: IncomingMessage) {
		//TODO: тут конечно хорошо было бы сделать middleware для проверки авторизации да и саму авторизацию
		const userId =  this.extractUserIdOrThrow(client, request);
		this.socketManager.addSocket(client, userId)
		this.logger.debug(`User connected: ${client.userId}`);
	}

	async handleDisconnect(client: ExtendedWebSocket) {
		try {
			await Promise.all(Array.from(client.rooms).map(room =>
				this.leaveGameUseCase.execute(room, client.userId)
			));
		} catch(_e) {}
		this.socketManager.disconnect(client.id)
		this.logger.debug(`User disconnected: ${client.userId}`);
	}

	private extractUserIdOrThrow(client: ExtendedWebSocket, request: IncomingMessage): string | never {
		const params = new URLSearchParams(request.url?.substring(1));
		const userId = params.get('userId');
		if (!userId) {
			this.sendEvent(
				client,
				DefaultServerEvents.ERROR,
				new ExceptionResponseDto(401, `Query param '${USER_ID_QUERY_PARAM}' was not provided`)
			);
			client.terminate();
		}
		return String(userId) ;
	}

	// client events

	@SubscribeMessage(GameClientEvents.OPEN_CELL)
	async handleOpenCell(@MessageBody() data: OpenCellDto, @ConnectedSocket() client: ExtendedWebSocket) {
		this.logReceivedEvent(GameClientEvents.OPEN_CELL, data, 'handled');
		await this.openCellUseCase.execute(client.userId, data.gameId, data.x, data.y);
	}

	@SubscribeMessage(GameClientEvents.JOIN_GAME)
	async handleJoinGame(@MessageBody() data: JoinGameDto, @ConnectedSocket() client: ExtendedWebSocket) {
		this.logReceivedEvent(GameClientEvents.JOIN_GAME, data, 'handled');
		this.socketManager.addToRoom(data.gameId, client.id)
		await this.joinGameUseCase.execute(data.gameId, client.userId);
	}

	@SubscribeMessage(GameClientEvents.LEAVE_GAME)
	async handleLeaveGame(@MessageBody() data: LeaveGameDto, @ConnectedSocket() client: ExtendedWebSocket) {
		this.logReceivedEvent(GameClientEvents.LEAVE_GAME, data, 'handled');
		await this.leaveGameUseCase.execute(data.gameId, client.userId);
		this.socketManager.addToRoom(data.gameId, client.id)
	}

	// server events

	@OnEvent(GameStartedEvent.name)
	async handleGameStartedEvent(event: GameStartedEvent) {
		this.logReceivedEvent(GameStartedEvent.name, event, 'sent');

		const response: GameStartedEvent = {
			gameId: event.gameId,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.GAME_STARTED, response)
	}

	@OnEvent(GameEndedEvent.name)
	async handleGameEndedEvent(event: GameEndedEvent) {
		this.logReceivedEvent(GameEndedEvent.name, event, 'sent');

		const response: GameEndedResponse = {
			gameId: event.gameId,
			winnerId: event.winnerId,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.GAME_ENDED, response)
	}

	@OnEvent(GameAbortedEvent.name)
	async handleGameAbortedEvent(event: GameAbortedEvent) {
		this.logReceivedEvent(GameAbortedEvent.name, event, 'sent');

		const response: GameAbortedResponse = {
			gameId: event.gameId,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.GAME_ABORTED, response)
	}

	@OnEvent(PlayerConnectedEvent.name)
	async handlePlayerConnectedEvent(event: PlayerConnectedEvent) {
		this.logReceivedEvent(PlayerConnectedEvent.name, event, 'sent');

		const response: PlayerConnectedResponse = {
			gameId: event.gameId,
			playerId: event.playerId,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.PLAYER_CONNECTED, response)
	}

	@OnEvent(PlayerDisconnectedEvent.name)
	async handlePlayerDisconnectedEvent(event: PlayerDisconnectedEvent) {
		this.logReceivedEvent(PlayerDisconnectedEvent.name, event, 'sent');

		const response: PlayerDisconnectedEvent = {
			gameId: event.gameId,
			playerId: event.playerId,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.PLAYER_DISCONNECTED, response)
	}

	@OnEvent(CellResultEvent.name)
	async handleCellResultEvent(event: CellResultEvent) {
		this.logReceivedEvent(CellResultEvent.name, event, 'sent');

		const response: CellResultResponse = {
			gameId: event.gameId,
			cellResult: {
				x: event.cell.getX(),
				y: event.cell.getY(),
				adjacentDiamonds: event.cell.getAdjacentDiamonds(),
				hasDiamond: event.cell.getHasDiamond(),
				isOpened: event.cell.getIsOpened(),
			},
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.CELL_RESULT, response)
	}

	@OnEvent(TurnSwitchedEvent.name)
	async handleTurnSwitchedEvent(event: TurnSwitchedEvent) {
		this.logReceivedEvent(CellResultEvent.name, event, 'sent');

		const response: TurnSwitchedEvent = {
			gameId: event.gameId,
			nextUserId: event.nextUserId,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.TURN_SWITCHED, response)
	}

	@OnEvent(PlayerScoreUpdatedEvent.name)
	async handlePlayerScoreUpdatedEvent(event: PlayerScoreUpdatedEvent) {
		this.logReceivedEvent(CellResultEvent.name, event, 'sent');

		const response: PlayerScoreUpdatedEvent = {
			gameId: event.gameId,
			playerId: event.playerId,
			diamondsCollected: event.diamondsCollected,
		};
		this.socketManager.broadcastToRoom(event.gameId, GameServerEvents.PLAYER_SCORE_UPDATED, response)
	}

	private logReceivedEvent(name: string, payload: any, type: 'handled' | 'sent') {
		this.logger.debug(`${type} event: ${name}\n${JSON.stringify(payload, null, 2)}`);
	}

	private sendEvent(client: ExtendedWebSocket, event: string, data: any) {
		client.send(JSON.stringify({ event, data }));
	}
}
