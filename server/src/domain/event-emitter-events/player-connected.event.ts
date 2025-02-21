export class PlayerConnectedEvent {
	constructor(
		public gameId: string,
		public playerId: string
	) {}
}
