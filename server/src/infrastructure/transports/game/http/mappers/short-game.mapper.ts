import { GameAggregate } from '@domain/entities/game/game.aggregate';
import { PlayerMapper } from '@infrastructure/transports/game/http/mappers/player.mapper';
import { plainToInstance } from 'class-transformer';
import { ShortGameResponse } from '@infrastructure/transports/game/http/responses/short-game.response';

export class ShortGameMapper {
	static map(game: GameAggregate) {
		return plainToInstance(ShortGameResponse, {
			id: game.getId(),
			status: game.getStatus(),
			startTime: game.getStartTime(),
			winnerPlayerId: game.getWinnerPlayerId(),
			nextTurnPlayerId: game.getNextTurnPlayerId(),
			players: game.getPlayers().map((p) => PlayerMapper.map(p)),
		});
	}
}
