import Vue from 'vue'
import VueRouter from 'vue-router'

import CreateGamePage from '@/pages/CreateGamePage.vue';
import ConnectToGamePage from '@/pages/ConnectToGamePage.vue';
import GamePage from '@/pages/GamePage.vue';

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		component: CreateGamePage,
	},
	{
		path: '/connect-to-game',
		component: ConnectToGamePage,
	},
	{
		path: '/game/:id',
		component: GamePage,
		props: true
	}
]

export default new VueRouter({
	mode: 'history',
	routes,
})