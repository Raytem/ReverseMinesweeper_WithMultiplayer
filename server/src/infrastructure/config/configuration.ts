export default () => ({
	app: {
		port: parseInt(process.env['APP_PORT'] || '3000'),
		ws: {
			port: parseInt(process.env['APP_WS_PORT'] || '3001')
		}
	},
})