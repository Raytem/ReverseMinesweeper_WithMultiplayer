import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import config from '@/infrastructure/config/configuration'
import { AllExceptionsFilter } from '@infrastructure/common/exception-filters/all-exception.filter';

async function bootstrap() {
	const logger = new Logger();
	const app = await NestFactory.create(AppModule, {
		logger: logger,
	});

	app.useGlobalFilters(new AllExceptionsFilter())

	const port = config().app.port;
	await app.listen(port);

	logger.log(`HTTP Server started on port: ${port}`);
	logger.log(`WebSocket (Socket.io) server started on port: ${config().app.ws.port}`);
}

bootstrap();
