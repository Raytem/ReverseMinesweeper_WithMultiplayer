import { Module } from '@nestjs/common';
import { GameWebSocketGateway } from '@infrastructure/transports/game/websocket/game-websocket.gateway';
import { HTTPGameController } from '@infrastructure/transports/game/http/http-game.controller';
import { RepositoriesModule } from '@infrastructure/repositories/repositories.module';
import { CustomEventEmitterModule } from '@infrastructure/services/custom-event-emitter/custom-event-emitter.module';
import { CreateGameUseCase, GetAllGamesUseCase, JoinGameUseCase, LeaveGameUseCase, OpenCellUseCase } from '@usecases/game';
import { GameEventHandlersModule } from '@infrastructure/domain-event-handlers/game/game-event-handlers.module';
import { GetGameByIdUseCase } from '@usecases/game/get-game-by-id.usecase';
import { SocketManagerService } from '@infrastructure/services/socket-manager';

@Module({
	imports: [RepositoriesModule, CustomEventEmitterModule, GameEventHandlersModule],
	controllers: [HTTPGameController],
	providers: [
		SocketManagerService,
		GetGameByIdUseCase,
		GameWebSocketGateway,
		CreateGameUseCase,
		GetAllGamesUseCase,
		JoinGameUseCase,
		LeaveGameUseCase,
		OpenCellUseCase,
	],
	exports: [],
})
export class GameTransportsModule {}
