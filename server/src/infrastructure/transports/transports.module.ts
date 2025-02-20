import { Module } from '@nestjs/common';
import { GameTransportsModule } from '@infrastructure/transports/game/game.transports.module';

@Module({
	imports: [GameTransportsModule],
	providers: [],
	exports: [],
})
export class TransportsModule {}