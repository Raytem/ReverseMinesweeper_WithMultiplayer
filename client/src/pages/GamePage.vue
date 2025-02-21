<template>
	<v-card class="game-card">
		<v-card-title>🎯 Игра: {{ game?._id }}</v-card-title>
		<v-card-text v-if="loading">⏳ Загрузка данных игры...</v-card-text>
		<v-card-text v-else-if="game">
			<p>📅 Статус: {{ game._status }}</p>
			<p>💎 Всего алмазов: {{ game._totalDiamonds }}</p>
			<p>👥 Игроков в игре: {{ game._players.length }}</p>
			<!-- Плашки с состоянием игры -->
			<v-alert v-if="currentPlayerTurn" type="info" :color="'blue'">
				🕹️ Сейчас ваш ход!
			</v-alert>
			<v-alert v-if="gameResult" :type="gameResult.type" :color="gameResult.color">
				{{ gameResult.message }}
			</v-alert>
		</v-card-text>
		<v-alert v-else type="error">❌ Игра не найдена</v-alert>

		<!-- Игровое поле -->
		<v-container class="centered-container">
			<game-field v-if="game" :field="game._field" :fieldSize="game._fieldSize" :gameId="game._id" />
		</v-container>

		<!-- Кнопка отключения -->
		<v-btn color="red" @click="handleDisconnect">Отключиться</v-btn>
	</v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config';
import GameField from '@/components/GameField.vue';
import axios from 'axios';
import WebSocketService from '@/services/WebSocketService';
import { EventBus } from '@/eventbus';

// Я ЗНАЮ ЧТО ТУТ ВСЕ ВЫГЛЯДИТ ОЧЕНЬ ПЛОХО И ТАК КАК НЕ НАДО ДЕЛАТЬ, НО Я СПЕШУ И ЛИШЬ БЫ ОНО РАБОТАЛО)
export default {
	components: {
		GameField
	},
	data() {
		return {
			game: null,
			loading: true,
			currentPlayerTurn: false,
			gameResult: null, // { type: 'success' | 'error', message: string, color: string }
			userId: null
		};
	},
	methods: {
		fetchGameData() {
			const gameId = this.$route.params.id;
			this.loading = true;

			axios.get(`${config.serverBaseUrl}/games/${gameId}`)
				.then(response => {
					this.game = response.data;
					this.loading = false;
				})
				.catch(error => {
					console.error('Error fetching game data', error);
					this.loading = false;
				});
		},
		generateUserId() {
			return uuidv4();
		},
		initializeWebSocket() {
			if (!this.userId) {
				this.userId = localStorage.getItem('userId') || this.generateUserId();
				localStorage.setItem('userId', this.userId);
			}

			// 🛑 Отключаем старый сокет перед созданием нового
			if (WebSocketService.socket && WebSocketService.socket.connected) {
				WebSocketService.leaveGame(this.$route.params.id);
				WebSocketService.disconnect();
			}

			if (!WebSocketService.socket) {
				WebSocketService.initializeSocket(this.userId);
			} else {
				WebSocketService.socket.connect()
			}


			WebSocketService.socket.on('connect', () => {
				console.log('✅ Connected to WebSocket server!');
				WebSocketService.joinGame(this.$route.params.id);
			});
		},

		handleDisconnect() {
			WebSocketService.leaveGame(this.$route.params.id);
			this.$router.push(`/`);
		},

		updateGameState(event, data) {
			if (data.gameId === this.$route.params.id) {
				switch (event) {
					case 'game-started':
						console.log('Game started', data);
						this.game._status = 'ongoing'
						break;
					case 'game-ended': {
						const message = data.winnerId === this.userId
							? 'Вы победили!'
							: 'Вы проиграли :('
						this.game._status = 'finished'
						this.gameResult = { type: 'success', message, color: 'green' }; // Пример победы
						break;
					}
					case 'game-aborted':
						this.gameResult = { type: 'error', message: 'Игра была прервана.', color: 'red' };
						this.game._status = 'finished'
						break;
					case 'player-connected':
						this.game._players.push({ id: data.playerId });
						break;
					case 'player-disconnected':
						this.game._players = this.game._players.filter(player => player.id !== data.playerId); // Удаляем игрока
						break;
					case 'turn-switched':
						this.currentPlayerTurn = data.nextUserId === this.userId
						break;
					case 'player-score-updating':
						console.log('Обновление счета игрока:', data);
						break;
					case 'cell-result': {
						const { x, y, hasDiamond, adjacentDiamonds, isOpened } = data.cellResult;
						const cell = this.game._field[y][x];
						cell._hasDiamond = hasDiamond;
						cell._adjacentDiamonds = adjacentDiamonds;
						cell._isOpened = isOpened;
					}
				}
			}
		},
	},
	mounted() {
		this.fetchGameData();
		this.initializeWebSocket();
	},
	created() {
		EventBus.$on('game-started', (data) => this.updateGameState('game-started', data));
		EventBus.$on('game-ended', (data) => this.updateGameState('game-ended', data));
		EventBus.$on('game-aborted', (data) => this.updateGameState('game-aborted', data));
		EventBus.$on('player-connected', (data) => this.updateGameState('player-connected', data));
		EventBus.$on('player-disconnected', (data) => this.updateGameState('player-disconnected', data));
		EventBus.$on('turn-switched', (data) => this.updateGameState('turn-switched', data));
		EventBus.$on('player-score-updating', (data) => this.updateGameState('player-score-updating', data));
		EventBus.$on('cell-result', (data) => this.updateGameState('cell-result', data));
	},
	beforeDestroy() {
		WebSocketService.leaveGame(this.$route.params.id);
		WebSocketService.disconnect();
	}
};
</script>

<style scoped>
.game-card {
	max-width: 700px;
	width: 100%;
	margin: 0 auto; /* Центрируем карточку по горизонтали */
}
.centered-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
}
</style>