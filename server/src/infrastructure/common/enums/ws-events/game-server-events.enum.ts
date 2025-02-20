export enum GameServerEvents {
	GAME_STARTED = 'game-started',
	GAME_ENDED = 'game-ended',
	GAME_ABORTED = 'game-aborted',
	PLAYER_CONNECTED = 'player-connected',
	PLAYER_DISCONNECTED = 'player-disconnected',
	CELL_RESULT = 'cell-result',
	TURN_SWITCHED = 'turn-switched',
	SCORE_UPDATED = 'score-updated',
}