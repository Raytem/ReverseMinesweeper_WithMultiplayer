import { Cell } from '@domain/entities/cell/cell.entity';
import { CellResponse } from '@infrastructure/transports/game/http/responses';
import { plainToInstance } from 'class-transformer';

export class CellMapper {
	static map(cell: Cell): CellResponse {
		const obj: CellResponse = {
			x: cell.getX(),
			y: cell.getY(),
			hasDiamond: cell.getHasDiamond(),
			adjacentDiamonds: cell.getAdjacentDiamonds(),
			isOpened: cell.getIsOpened(),
		};
		return plainToInstance(CellResponse, obj);
	}
}
