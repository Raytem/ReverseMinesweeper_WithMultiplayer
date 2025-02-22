import { Expose, Type } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { CellResponse } from '@infrastructure/transports/game/http/responses/cell.response';
import { ShortGameResponse } from '@infrastructure/transports/game/http/responses/short-game.response';

export class GameWithOpenedCellsResponse extends PickType(ShortGameResponse, [
	'id',
	'status',
	'fieldSize',
	'totalDiamonds',
	'startTime',
	'winnerPlayerId',
	'nextTurnPlayerId',
	'players',
]) {
	@Type(() => CellResponse)
	@ApiProperty({ type: CellResponse, isArray: true })
	@Expose()
	openedCells: CellResponse[];
}
