import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import config from '@/infrastructure/config/configuration';
import { setup } from '@root/setup';

async function bootstrap() {
	const logger = new Logger();
	const app = await NestFactory.create(AppModule, {
		logger: logger,
	});

	setup(app);

	const port = config().app.port;
	await app.listen(port);

	logger.log(`HTTP Server started on port: ${port}`);
	logger.log(`WebSocket (ws) server started on port: ${config().app.ws.port}`);
}

bootstrap();
