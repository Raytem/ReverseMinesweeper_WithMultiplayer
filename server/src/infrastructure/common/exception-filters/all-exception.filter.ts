import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Response } from 'express';
import { ExceptionResponseDto } from '@infrastructure/common/shared/responses/exception.response';
import { DefaultServerEvents } from '@infrastructure/common/enums/ws-events/default-server-events.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private logger: Logger = new Logger(AllExceptionsFilter.name);

	catch(exception: any, host: ArgumentsHost): void {
		this.logger.error(exception?.message || 'Unknown error', exception?.stack || '');

		const type = host.getType();

		const httpContext = host.switchToHttp();
		const wsContext = host.switchToWs();

		let statusCode = undefined;
		let message = undefined;
		let errors = undefined;
		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();

			if (typeof exception.getResponse() !== 'string' && typeof exception.getResponse() === 'object') {
				const response = exception.getResponse() as {
					message?: string | string[];
					error?: string;
				};

				if (response.message instanceof Array) {
					message = response.error;
					errors = response.message;
				} else {
					message = response.message;
				}
			}
		}

		if (statusCode === undefined) {
			statusCode = 500;
		}
		if (message === undefined) {
			message = exception?.message || 'Internal server error';
		}
		if (exception?.response?.errors) {
			errors = exception?.response?.errors;
		}

		const responseBody: ExceptionResponseDto = {
			statusCode,
			message,
			errors,
		};

		if (type === 'http') {
			const response: Response = httpContext.getResponse();
			response.status(responseBody.statusCode).json(responseBody);
		}

		if (type === 'ws') {
			const wsClient = wsContext.getClient<Socket>();
			if (wsClient) {
				wsClient.emit(DefaultServerEvents.ERROR, responseBody);
			}
		}

		return;
	}
}
