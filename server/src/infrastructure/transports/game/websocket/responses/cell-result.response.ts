export class CellResultResponse {
	gameId: string;
	cellResult: {
		x: number;
		y: number;
		hasDiamond: boolean;
		adjacentDiamonds: number;
		isOpened: boolean;
	};
}
