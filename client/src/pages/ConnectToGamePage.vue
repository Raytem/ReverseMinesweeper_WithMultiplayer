<template>
	<v-container>
		<v-card>
			<v-card-title>🔗 Подключиться к игре</v-card-title>
			<v-card-text>
				<v-form ref="form" @submit.prevent="joinGame">
					<v-text-field
						v-model="gameId"
						label="Введите ID игры"
						:rules="idRules"
						required
					/>
					<v-btn color="primary" :disabled="!gameId" type="submit">
						🚀 Подключиться
					</v-btn>
				</v-form>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
export default {
	name: 'JoinGameForm',
	data() {
		return {
			gameId: '',
			idRules: [(v) => !!v || 'ID игры обязателен'],
		};
	},
	methods: {
		joinGame() {
			if (this.gameId) {
				this.$router.push(`/game/${this.gameId.trim()}`);
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