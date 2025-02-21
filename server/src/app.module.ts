import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransportsModule } from '@infrastructure/transports/transports.module';
import { ConfigModule } from '@nestjs/config';
import config from './infrastructure/config/configuration';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [config],
		}),
		EventEmitterModule.forRoot(),
		CqrsModule,
		TransportsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
