import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from '@infrastructure/common/exception-filters/all-exception.filter';

export function setup(app: INestApplication) {
	app.enableCors();

	app.useGlobalFilters(new AllExceptionsFilter());
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector), {
			strategy: 'excludeAll',
			excludeExtraneousValues: true,
		})
	);

	const config = new DocumentBuilder()
		.setTitle('Reverse minesweeper game API')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	return app;
}