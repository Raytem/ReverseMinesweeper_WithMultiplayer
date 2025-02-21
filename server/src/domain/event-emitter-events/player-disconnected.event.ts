export class PlayerDisconnectedEvent {
	constructor(
		public gameId: string,
		public playerId: string,
	) {}
}