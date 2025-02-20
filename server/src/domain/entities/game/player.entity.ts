
export class Player {
	private readonly _id: string;
	private _diamondsCollected: number;

	constructor(id: string) {
		this._id = id;
		this._diamondsCollected = 0;
	}

	public get id(): string {
		return this._id;
	}

	public get diamondsCollected(): number {
		return this._diamondsCollected;
	}

	public collectDiamond(): void {
		this._diamondsCollected++
	}

	public resetCollectedDiamonds(): void {
		this._diamondsCollected = 0;
	}

	public hasCollectedAll(totalDiamonds: number): boolean {
		return this._diamondsCollected >= totalDiamonds;
	}
}