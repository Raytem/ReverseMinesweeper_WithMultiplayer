import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import config from '@/infrastructure/config/configuration';
import { AllExceptionsFilter } from '@infrastructure/common/exception-filters/all-exception.filter';

async function bootstrap() {
	const logger = new Logger();
	const app = await NestFactory.create(AppModule, {
		logger: logger,
	});

	app.useGlobalFilters(new AllExceptionsFilter());
	app.useGlobalPipes(new ValidationPipe());

	const port = config().app.port;
	await app.listen(port);

	logger.log(`HTTP Server started on port: ${port}`);
	logger.log(`WebSocket (Socket.io) server started on port: ${config().app.ws.port}`);
}

bootstrap();
