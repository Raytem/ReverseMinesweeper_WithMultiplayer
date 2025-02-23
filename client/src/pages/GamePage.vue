<template>
	<v-card class="game-card">
		<v-card-title>🎯 Игра: {{ game?.id }}</v-card-title>
		<v-card-text v-if="loading">⏳ Загрузка данных игры...</v-card-text>
		<v-card-text v-else-if="game">
			<h3>📅 Статус: {{ getDisplayableGameStatus() }}</h3>
			<h3>💎 Всего алмазов: {{ game.totalDiamonds }}</h3>
			<h3>👥 Игроков в игре: {{ game.players.length }}</h3>

			<!--	Счет игроков		-->
			<v-row v-if="game.status !== GameStatus.NOT_STARTED" class="score-row" justify="space-between" align="center">
				<v-col>
					<span class="score-label">Вы: {{ userDiamonds }} 💎</span>
				</v-col>
				<v-col class="text-right">
					<span class="score-label">Оппонент: {{ opponentDiamonds }} 💎</span>
				</v-col>
			</v-row>

			<!--	Статус хода		-->
			<v-alert
				v-if="game.nextTurnPlayerId !== null && game.status !== GameStatus.FINISHED"
				type="info"
				:color="game.nextTurnPlayerId === userId ? 'blue' : 'orange'"
				class="status-card"
			>
				<h4>
					🕹 {{ game.nextTurnPlayerId === userId ? 'Сейчас ваш ход!' : 'Ходит ваш оппонент!' }}
				</h4>
			</v-alert>

			<!--	Результаты игры	-->
			<v-alert
				v-if="game.winnerPlayerId !== null"
				:type="game.winnerPlayerId === userId ? 'success' : 'error'"
				class="status-card"
			>
				<h4>
					{{ game.winnerPlayerId === userId ? '🏆 Вы победили!' : '❌ Вы проиграли' }}
				</h4>
			</v-alert>

			<!--	Плашка при отмене игры	-->
			<v-alert
				v-if="isGameAborted"
				type="error"
				class="status-card"
			>
				<h4>Игра была прервана</h4>
			</v-alert>
		</v-card-text>

		<v-alert v-else type="error">❌ Игра не найдена</v-alert>

		<!-- Игровое поле -->
		<v-container class="centered-container">
			<game-field v-if="game" :field="game.field" :fieldSize="game.fieldSize" :gameId="game.id" />
		</v-container>

		<!-- Кнопка отключения -->
		<v-btn color="red" @click="handleLeaveGame">Отключиться</v-btn>
	</v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import WebSocketService from '@/services/websocket/WebSocketService';
import GameService from '@/services/game/GameService';
import { GameServerEvents } from '@/services/websocket/events/GameServerEvents';
import { EventBus } from '@/eventbus';
import GameField from '@/components/GameField.vue';
import { GameStatus } from '@/services/game/GameStatus';

export default {
	computed: {
		GameStatus() {
			return GameStatus
		}
	},
	components: {
		GameField
	},
	data() {
		return {
			userId: null,
			loading: true,

			game: null,
			isGameAborted: false,
			userDiamonds: 0,
			opponentDiamonds: 0,

			wsEventHandlersMap: new Map([
				[GameServerEvents.GAME_STARTED, this.handleGameStarted],
				[GameServerEvents.GAME_ENDED, this.handleGameEnded],
				[GameServerEvents.GAME_ABORTED, this.handleGameAborted],
				[GameServerEvents.TURN_SWITCHED, this.handleTurnSwitched],
				[GameServerEvents.CELL_RESULT, this.handleCellResult],
				[GameServerEvents.PLAYER_CONNECTED, this.handlePlayerConnected],
				[GameServerEvents.PLAYER_DISCONNECTED, this.handlePlayerDisconnected],
				[GameServerEvents.PLAYER_SCORE_UPDATED, this.handlePlayerScoreUpdated],
			])
		};
	},
	methods: {
		handleWebsocketEvent(event, data) {
			const handler = this.wsEventHandlersMap.get(event)
			if (handler !== undefined) {
				handler.call(this, data)
			} else {
				console.debug(`No handler for ws event: ${event}`);
			}
		},

		async fetchGameData() {
			try {
				this.loading = true;
				const game = await GameService.getGameWithOpenedCells(this.$route.params.id);
				this.game = {
					...game,
					field: this.generateField(game.fieldSize, game.openedCells),
				}
				this.game.players.forEach((p) => {
					this.updatePlayerScoreState(p.id, p.diamondsCollected)
				})
			} catch (error) {
				console.error(error)
			} finally {
				this.loading = false;
			}
		},

		updatePlayerScoreState(playerId, diamondsCollected) {
			if (!this.game.players.find((p) => p.id === playerId)) {
				return;
			}

			if (this.userId === playerId) {
				this.userDiamonds = diamondsCollected;
			} else {
				this.opponentDiamonds = diamondsCollected;
			}
		},

		generateField(fieldSize, openedCells) {
			const openedCellsMap = new Map();
			openedCells.forEach((cell) => openedCellsMap.set(`${cell.x},${cell.y}`, cell))

			return Array.from({ length: fieldSize }, (_, y) => {
				return Array.from({ length: fieldSize }, (_, x) => {
					const openedCell = openedCellsMap.get(`${x},${y}`);
					if (openedCell) {
						return openedCell
					}
					return {
						x,
						y,
						isOpened: false,
					}
				});
			});
		},

		initializeWebSocket() {
			if (!this.userId) {
				this.userId = localStorage.getItem('userId') || uuidv4();
				localStorage.setItem('userId', this.userId);
			}

			if (WebSocketService.isSocketConnected()) {
				WebSocketService.joinGame(this.$route.params.id);
			} else {
				WebSocketService.connectSocket(this.userId, () => {
					console.debug('Connected to WebSocket server');
					WebSocketService.joinGame(this.$route.params.id);
				});
			}
		},

		getDisplayableGameStatus() {
			const statusMap = new Map([
				[GameStatus.NOT_STARTED, 'Ожидание игороков'],
				[GameStatus.ONGOING, 'Игра в процессе'],
				[GameStatus.FINISHED, 'Завершена'],
			])
			return statusMap.get(this.game.status) ?? 'Не определен';
		},

		// button events
		handleLeaveGame() {
			WebSocketService.leaveGame(this.$route.params.id);
			this.$router.push(`/`);
		},

		// websocket events
		handleGameStarted() {
			this.game.status = GameStatus.ONGOING;
		},

		handleGameEnded(data) {
			this.game.status = GameStatus.FINISHED
			this.game.winnerPlayerId = data.winnerId
		},

		handleGameAborted() {
			this.game.status = GameStatus.FINISHED
			this.isGameAborted = true;
		},

		handleTurnSwitched(data) {
			this.game.nextTurnPlayerId = data.nextUserId
		},

		handleCellResult(data) {
			const { x, y, adjacentDiamonds, hasDiamond, isOpened } = data.cellResult;
			const cell = this.game.field[y][x];
			cell.adjacentDiamonds = adjacentDiamonds;
			cell.hasDiamond = hasDiamond;
			cell.isOpened = isOpened;
		},

		handlePlayerConnected(data) {
			this.game.players.push({ id: data.playerId });
		},

		handlePlayerDisconnected(data) {
			this.game.players = this.game.players
				.filter(player => player.id !== data.playerId);
		},

		handlePlayerScoreUpdated(data) {
			this.updatePlayerScoreState(data.playerId, data.diamondsCollected)
		},
	},
	mounted() {
		this.fetchGameData();
		this.initializeWebSocket();
	},
	created() {
		Array.from(this.wsEventHandlersMap.keys()).forEach((event) => {
			EventBus.$on(event, (data) => this.handleWebsocketEvent(event, data))
		})
	},
	beforeDestroy() {
		WebSocketService.leaveGame(this.$route.params.id);
		WebSocketService.disconnectSocket();
		Array.from(this.wsEventHandlersMap.keys()).forEach((event) => {
			EventBus.$off(event, (data) => this.handleWebsocketEvent(event, data))
		})
	}
};
</script>

<style scoped>
.score-row {
	margin-top: 20px;
}

.score-label {
	font-size: 18px;
	font-weight: bold;
}

.status-card {
	margin-top: 20px;
}

.game-card {
	max-width: 700px;
	width: 100%;
	margin: 0 auto;
}

.centered-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
}
</style>