import { Module } from '@nestjs/common';
import { ICustomEventEmitterService } from '@domain/services/custom-event-emitter.service.interface';
import { NestEventEmitterService } from '@infrastructure/services/custom-event-emitter/nest-event-emitter.service';

@Module({
	providers: [
		NestEventEmitterService,
		{
			provide: ICustomEventEmitterService.$,
			useClass: NestEventEmitterService,
		},
	],
	exports: [ICustomEventEmitterService.$],
})
export class CustomEventEmitterModule {}
