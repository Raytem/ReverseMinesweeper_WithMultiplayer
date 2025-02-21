import {
	ConnectedSocket, MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import config from '@infrastructure/config/configuration';
import { AllExceptionsFilter } from '@infrastructure/common/exception-filters/all-exception.filter';
import { DefaultServerEvents } from '@infrastructure/common/enums/ws-events/default-server-events.enum';
import { ExceptionResponseDto } from '@infrastructure/common/shared/responses/exception.response';
import { GameServerEvents } from '@infrastructure/common/enums/ws-events/game-server-events.enum';
import { GameClientEvents } from '@infrastructure/common/enums/ws-events/game-client-events.enum';
import { JoinGameUseCase, LeaveGameUseCase, OpenCellUseCase } from '@usecases/game';
import {
	GameStartedEvent,
	GameEndedEvent,
	GameAbortedEvent,
	PlayerConnectedEvent,
	PlayerDisconnectedEvent, CellResultEvent, TurnSwitchedEvent, PlayerScoreUpdatedEvent,
} from '@domain/event-emitter-events';
import { JoinGameDto, LeaveGameDto, OpenCellDto } from '@infrastructure/transports/game/websocket/dto';
import {
	CellResultResponse,
	GameAbortedResponse,
	GameEndedResponse,
	PlayerConnectedResponse,
} from '@infrastructure/transports/game/websocket/responses';

type SocketWithUserId = Socket & { userId: string };

@WebSocketGateway(config().app.ws.port, { transports: ['websocket'] })
@UseFilters(AllExceptionsFilter)
@UsePipes(new ValidationPipe())
export class GameWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private readonly server: Server;
	private readonly logger = new Logger(GameWebSocketGateway.name);

	constructor(
		private readonly joinGameUseCase: JoinGameUseCase,
		private readonly leaveGameUseCase: LeaveGameUseCase,
		private readonly openCellUseCase: OpenCellUseCase
	) {}

	async handleConnection(client: SocketWithUserId) {
		this.logger.debug(`Client connected: ${client.id}`);

		const userIdHeader = 'x-user-id';
		const userId = client.handshake.headers[userIdHeader];

		//TODO: тут конечно хорошо было бы сделать middleware для проверки авторизации да и саму авторизацию
		if (!userId) {
			this.server.emit(
				DefaultServerEvents.ERROR,
				new ExceptionResponseDto(401, `Header '${userIdHeader}' was not provided`)
			);
			client.disconnect()
		}
		client.userId = String(userId);
	}

	async handleDisconnect(client: Socket) {
		this.logger.debug(`Client disconnected: ${client.id}`);
	}

	// client events

	@SubscribeMessage(GameClientEvents.OPEN_CELL)
	async handleOpenCell(
		@MessageBody() data: OpenCellDto,
		@ConnectedSocket() client: SocketWithUserId,
	) {
		this.logReceivedEvent(GameClientEvents.OPEN_CELL, data);
		await this.openCellUseCase.execute(client.userId, data.gameId, data.x, data.y);
	}

	@SubscribeMessage(GameClientEvents.JOIN_GAME)
	async handleJoinGame(
		@MessageBody() data: JoinGameDto,
		@ConnectedSocket() client: SocketWithUserId,
	) {
		this.logReceivedEvent(GameClientEvents.JOIN_GAME, data);
		await this.joinGameUseCase.execute(data.gameId, client.userId);
	}

	@SubscribeMessage(GameClientEvents.LEAVE_GAME)
	async handleLeaveGame(
		@MessageBody() data: LeaveGameDto,
		@ConnectedSocket() client: SocketWithUserId,
	) {
		this.logReceivedEvent(GameClientEvents.LEAVE_GAME, data);
		await this.leaveGameUseCase.execute(data.gameId, client.userId);
	}

	// server events

	@OnEvent(GameStartedEvent.name)
	async handleGameStartedEvent(event: GameStartedEvent) {
		this.logReceivedEvent(GameStartedEvent.name, event)

		const response: GameStartedEvent = {
			gameId: event.gameId,
		}
		this.server.to(event.gameId).emit(GameServerEvents.GAME_STARTED, response);
	}

	@OnEvent(GameEndedEvent.name)
	async handleGameEndedEvent(event: GameEndedEvent) {
		this.logReceivedEvent(GameEndedEvent.name, event)

		const response: GameEndedResponse = {
			gameId: event.gameId,
			winnerId: event.winnerId,
		}
		this.server.to(event.gameId).emit(GameServerEvents.GAME_ENDED, response);
	}

	@OnEvent(GameAbortedEvent.name)
	async handleGameAbortedEvent(event: GameAbortedEvent) {
		this.logReceivedEvent(GameAbortedEvent.name, event)

		const response: GameAbortedResponse = {
			gameId: event.gameId,
		}
		this.server.to(event.gameId).emit(GameServerEvents.GAME_ABORTED, response);
	}

	@OnEvent(PlayerConnectedEvent.name)
	async handlePlayerConnectedEvent(event: PlayerConnectedEvent) {
		this.logReceivedEvent(PlayerConnectedEvent.name, event)

		const response: PlayerConnectedResponse = {
			gameId: event.gameId,
			playerId: event.playerId
		}
		this.server.to(event.gameId).emit(GameServerEvents.PLAYER_CONNECTED, response);
	}

	@OnEvent(PlayerDisconnectedEvent.name)
	async handlePlayerDisconnectedEvent(event: PlayerDisconnectedEvent) {
		this.logReceivedEvent(PlayerDisconnectedEvent.name, event)

		const response: PlayerDisconnectedEvent = {
			gameId: event.gameId,
			playerId: event.playerId
		}
		this.server.to(event.gameId).emit(GameServerEvents.PLAYER_DISCONNECTED, response);
	}

	@OnEvent(CellResultEvent.name)
	async handleCellResultEvent(event: CellResultEvent) {
		this.logReceivedEvent(CellResultEvent.name, event)

		const response: CellResultResponse = {
			gameId: event.gameId,
			cellResult: event.cell
		}
		this.server.to(event.gameId).emit(GameServerEvents.CELL_RESULT, response);
	}

	@OnEvent(TurnSwitchedEvent.name)
	async handleTurnSwitchedEvent(event: TurnSwitchedEvent) {
		this.logReceivedEvent(CellResultEvent.name, event)

		const response: TurnSwitchedEvent = {
			gameId: event.gameId,
			nextUserId: event.nextUserId
		}
		this.server.to(event.gameId).emit(GameServerEvents.TURN_SWITCHED, response);
	}

	@OnEvent(PlayerScoreUpdatedEvent.name)
	async handlePlayerScoreUpdatedEvent(event: PlayerScoreUpdatedEvent) {
		this.logReceivedEvent(CellResultEvent.name, event)

		const response: PlayerScoreUpdatedEvent = {
			gameId: event.gameId,
			playerId: event.playerId,
			diamondsCollected: event.diamondsCollected
		}
		this.server.to(event.gameId).emit(GameServerEvents.PLAYER_SCORE_UPDATED, response);
	}


	private logReceivedEvent(name: string, payload: any) {
		this.logger.debug(`Handled event: ${name}`, payload);
	}
}
