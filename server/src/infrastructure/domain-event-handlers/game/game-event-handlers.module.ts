import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CellResultHandler } from '@infrastructure/domain-event-handlers/game/cell-result.handler';
import { GameAbortedHandler } from '@infrastructure/domain-event-handlers/game/game-aborted.handler';
import { GameEndedHandler } from '@infrastructure/domain-event-handlers/game/game-ended.handler';
import { GameStartedHandler } from '@infrastructure/domain-event-handlers/game/game-started.handler';
import { PlayerConnectedHandler } from '@infrastructure/domain-event-handlers/game/player-connected.handler';
import { PlayerDisconnectedHandler } from '@infrastructure/domain-event-handlers/game/player-disconnected.event';
import { PlayerScoreUpdatedHandler } from '@infrastructure/domain-event-handlers/game/player-score-updated.handler';
import { TurnSwitchedHandler } from '@infrastructure/domain-event-handlers/game/turn-switched.handler';

@Module({
	imports: [CqrsModule],
	providers: [
		CellResultHandler,
		GameAbortedHandler,
		GameEndedHandler,
		GameStartedHandler,
		PlayerConnectedHandler,
		PlayerDisconnectedHandler,
		PlayerScoreUpdatedHandler,
		TurnSwitchedHandler,
	],
	exports: [CqrsModule],
})
export class GameEventHandlersModule {}
