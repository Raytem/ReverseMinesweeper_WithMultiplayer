import { GameAggregate } from '@domain/entities/game/game.aggregate';
import { GameWithOpenedCellsResponse } from '@infrastructure/transports/game/http/responses/game-with-opened-cells.response';
import { CellMapper } from '@infrastructure/transports/game/http/mappers/cell.mapper';
import { PlayerMapper } from '@infrastructure/transports/game/http/mappers/player.mapper';
import { plainToInstance } from 'class-transformer';

export class GameWithOpenedCellsMapper {
	static map(game: GameAggregate): GameWithOpenedCellsResponse {
		const obj: GameWithOpenedCellsResponse  = {
			id: game.getId(),
			status: game.getStatus(),
			fieldSize: game.getFieldSize(),
			totalDiamonds: game.getTotalDiamonds(),
			startTime: game.getStartTime(),
			winnerPlayerId: game.getWinnerPlayerId(),
			nextTurnPlayerId: game.getNextTurnPlayerId(),
			players: game.getPlayers().map((p) => PlayerMapper.map(p)),
			openedCells: game
				.getField()
				.flat()
				.filter((c) => c.getIsOpened())
				.map((c) => CellMapper.map(c)),
		}
		return plainToInstance(GameWithOpenedCellsResponse, obj);
	}
}
