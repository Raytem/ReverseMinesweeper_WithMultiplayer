<template>
	<v-container fluid>
		<v-app-bar
			color="orange"
		>
			<v-spacer></v-spacer>
			<v-btn class="ml-3" outlined>
				<router-link to="/">Создание игры</router-link>
			</v-btn>
			<v-btn class="ml-3" outlined>
				<router-link to="/connect-to-game">Подключение к игре</router-link>
			</v-btn>
		</v-app-bar>
	</v-container>
</template>

<script>
export default {
	components: {  },
};
</script>

<style lang="scss" scoped>

</style>