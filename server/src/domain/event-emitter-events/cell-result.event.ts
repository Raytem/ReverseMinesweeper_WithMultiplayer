import { Cell } from '@domain/entities/cell/cell.entity';

export class CellResultEvent {
	constructor(
		public gameId: string,
		public cell: Cell
	) {}
}
