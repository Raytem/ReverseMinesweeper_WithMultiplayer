export class Cell {
	private readonly x: number;
	private readonly y: number;
	private adjacentDiamonds: number;
	private hasDiamond: boolean;
	private isOpened: boolean;

	constructor(x: number, y: number, hasDiamond: boolean, adjacentDiamonds: number, isOpened: boolean = false) {
		this.x = x;
		this.y = y;
		this.hasDiamond = hasDiamond;
		this.isOpened = isOpened;
		this.adjacentDiamonds = adjacentDiamonds;
	}

	public getX(): number {
		return this.x;
	}

	public getY(): number {
		return this.y;
	}

	public getHasDiamond(): boolean {
		return this.hasDiamond;
	}

	public getIsOpened(): boolean {
		return this.isOpened;
	}

	public getAdjacentDiamonds(): number {
		return this.adjacentDiamonds;
	}

	public open(): void {
		this.isOpened = true;
	}

	setHasDiamond(hasDiamond: boolean) {
		this.hasDiamond = hasDiamond;
	}

	setAdjacentDiamonds(adjacentDiamonds: number) {
		this.adjacentDiamonds = adjacentDiamonds;
	}
}
