import { $gameApi } from '@/http/GameApi';

class GameService {
	async createGame(fieldSize, totalDiamonds) {
		const body = {
			fieldSize,
			totalDiamonds,
		}

		const response = await $gameApi.post('/games', body);
		return response.data;
	}

	async getGameWithOpenedCells(gameId) {
		const response = await $gameApi.get(`/games/${gameId}`);
		return response.data;
	}

	async getAllGames() {
		const response = await $gameApi.get(`/games`);
		return response.data;
	}
}

export default new GameService();