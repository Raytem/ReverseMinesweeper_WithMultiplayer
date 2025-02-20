import { Module } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { InMemoryGameRepository } from '@infrastructure/repositories/in-memory-game.repository';

@Module({
	imports: [],
	providers: [
		{	//TODO: использовать нормальное хранилище (DB/Redis)
			provide: IGameRepository.$,
			useClass: InMemoryGameRepository,
		}
	],
	exports: [IGameRepository.$],
})
export class RepositoriesModule {}
