import { Module } from '@nestjs/common';
import { GameWebSocketGateway } from '@infrastructure/transports/game/websocket/game-websocket.gateway';
import { HTTPGameController } from '@infrastructure/transports/game/http/http-game.controller';

@Module({
	imports: [],
	controllers: [HTTPGameController],
	providers: [GameWebSocketGateway],
	exports: [],
})
export class GameTransportsModule {}