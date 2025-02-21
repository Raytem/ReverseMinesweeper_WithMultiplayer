<template>
  <v-app>
	<v-container fluid>
		<AppNavbar />
		<router-view />
	</v-container>
  </v-app>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';

export default {
  name: 'App',

  components: {
	AppNavbar
  },

  data: () => ({
    //
  }),
};
</script>
