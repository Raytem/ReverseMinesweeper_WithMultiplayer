<template>
	<v-container>
		<v-card>
			<v-card-title>🎮 Создать новую игру</v-card-title>
			<v-card-text>
				<v-form ref="form" @submit.prevent="submitForm">
					<v-text-field
						label="Размер поля (от 2 до 6)"
						v-model.number="fieldSize"
						:rules="fieldSizeRules"
						type="number"
						required
					/>

					<v-text-field
						label="Количество алмазов (нечётное)"
						v-model.number="diamondsCount"
						:rules="diamondsCountRules"
						type="number"
						required
					/>

					<v-btn color="primary" type="submit" :disabled="loading || !isFormValid">
						{{ loading ? '⏳ Создаём...' : '🚀 Создать игру' }}
					</v-btn>
				</v-form>

				<!-- 🏷 Плашка с ID игры -->
				<v-alert
					v-if="createdGameId"
					type="success"
					class="mt-4"
					border="left"
					elevation="2"
				>
					🎉 Игра успешно создана!
					<br />
					🏷 <strong>ID игры: <br>{{ createdGameId }}</strong>
				</v-alert>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
import GameService from '@/services/game/GameService';

export default {
	name: 'CreateGameForm',
	data() {
		return {
			fieldSize: 2,
			diamondsCount: 1,
			createdGameId: null,
			loading: false,
			fieldSizeRules: [
				(v) => !!v || 'Размер поля обязателен',
				(v) => (v >= 2 && v <= 6) || 'Размер поля должен быть от 2 до 6',
			],
			diamondsCountRules: [
				(v) => !!v || 'Количество алмазов обязательно',
				(v) => v > 0 || 'Должно быть хотя бы 1 алмаз',
				(v) =>
					v <= this.maxDiamonds ||
					`Максимальное количество алмазов — ${this.maxDiamonds}`,
				(v) => v % 2 === 1 || 'Количество алмазов должно быть нечётным',
			],
		};
	},
	computed: {
		maxDiamonds() {
			return this.fieldSize * this.fieldSize;
		},
		isFormValid() {
			return (
				this.fieldSize >= 2 &&
				this.fieldSize <= 6 &&
				this.diamondsCount > 0 &&
				this.diamondsCount <= this.maxDiamonds &&
				this.diamondsCount % 2 === 1
			);
		},
	},
	watch: {
		fieldSize() {
			this.updateDiamondsCountRules();
			if (this.diamondsCount > this.maxDiamonds) {
				this.diamondsCount = this.maxDiamonds;
			}
		},
	},
	methods: {
		updateDiamondsCountRules() {
			this.diamondsCountRules = [
				(v) => !!v || 'Количество алмазов обязательно',
				(v) => v > 0 || 'Должно быть хотя бы 1 алмаз',
				(v) =>
					v <= this.maxDiamonds ||
					`Максимальное количество алмазов — ${this.maxDiamonds}`,
				(v) => v % 2 === 1 || 'Количество алмазов должно быть нечётным',
			];
		},
		async submitForm() {
			if (this.isFormValid) {
				try {
					this.loading = true;
					const game = await GameService.createGame(this.fieldSize, this.diamondsCount)
					this.createdGameId = game.id;
				} finally {
					this.loading = false;
				}
			}
		},
	},
};
</script>

<style scoped>
.v-card {
	max-width: 400px;
	margin: 0 auto;
}
</style>