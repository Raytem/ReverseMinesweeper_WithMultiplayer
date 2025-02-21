export class TurnSwitchedEvent {
	constructor(
		public gameId: string,
		public nextUserId: string
	) {}
}
