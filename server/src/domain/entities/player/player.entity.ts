import { AggregateRoot } from '@nestjs/cqrs';

export class Player extends AggregateRoot {
	private readonly id: string;
	private diamondsCollected: number;

	constructor(id: string) {
		super();
		this.id = id;
		this.diamondsCollected = 0;
	}

	public getId(): string {
		return this.id;
	}

	public getDiamondsCollected(): number {
		return this.diamondsCollected;
	}

	public collectDiamond(): void {
		this.diamondsCollected++;
	}

	public resetCollectedDiamonds(): void {
		this.diamondsCollected = 0;
	}

	public hasCollectedAll(totalDiamonds: number): boolean {
		return this.diamondsCollected >= totalDiamonds;
	}
}
