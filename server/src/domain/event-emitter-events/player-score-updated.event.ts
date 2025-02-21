export class PlayerScoreUpdatedEvent {
	constructor(
		public gameId: string,
		public playerId: string,
		public diamondsCollected: number
	) {}
}