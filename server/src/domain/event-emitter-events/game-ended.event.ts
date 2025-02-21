export class GameEndedEvent {
	constructor(
		public gameId: string,
		public winnerId: string,
	) {}
}