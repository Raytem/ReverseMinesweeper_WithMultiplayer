export class Cell {
	private readonly _x: number;
	private readonly _y: number;
	private readonly _hasDiamond: boolean;
	private readonly _adjacentDiamonds: number;
	private _isOpened: boolean;

	constructor(
		x: number,
		y: number,
		hasDiamond: boolean,
		adjacentDiamonds: number,
		isOpened: boolean = false,
	) {
		this._x = x;
		this._y = y;
		this._hasDiamond = hasDiamond;
		this._isOpened = isOpened;
		this._adjacentDiamonds = adjacentDiamonds;
	}

	public get x(): number {
		return this._x;
	}

	public get y(): number {
		return this._y
	}

	public get hasDiamond(): boolean {
		return this._hasDiamond;
	}

	public get isOpened(): boolean {
		return this._isOpened;
	}

	public get adjacentDiamonds(): number {
		return this._adjacentDiamonds;
	}

	public open(): void {
		this._isOpened = true;
	}
}

