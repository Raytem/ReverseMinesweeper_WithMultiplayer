import { Player } from '@domain/entities/player/player.entity';
import { PlayerResponse } from '@infrastructure/transports/game/http/responses';
import { plainToInstance } from 'class-transformer';

export class PlayerMapper {
	static map(player: Player): PlayerResponse {
		const obj: PlayerResponse = {
			id: player.getId(),
			diamondsCollected: player.getDiamondsCollected(),
		}
		return plainToInstance(PlayerResponse, obj);
	}
}
