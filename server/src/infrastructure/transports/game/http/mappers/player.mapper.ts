import { Player } from '@domain/entities/player/player.entity';
import { PlayerResponse } from '@infrastructure/transports/game/http/responses';

export class PlayerMapper {
	static map(player: Player): PlayerResponse {
		return {
			id: player.getId(),
			diamondsCollected: player.getDiamondsCollected(),
		};
	}
}
