import { Cell } from '@domain/entities/cell/cell.entity';
import { CellResponse } from '@infrastructure/transports/game/http/responses';

export class CellMapper {
	static map(cell: Cell): CellResponse {
		return {
			x: cell.getX(),
			y: cell.getY(),
			hasDiamond: cell.getHasDiamond(),
			adjacentDiamonds: cell.getAdjacentDiamonds(),
			isOpened: cell.getIsOpened(),
		};
	}
}
