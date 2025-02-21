import { ICrateGameAggregate } from '@domain/entities/game/interfaces/create-game-aggregate.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { GameAggregate } from '@domain/entities/game/game.aggregate';

@Injectable()
export class CreateGameUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository
	) {}

	async execute(dto: ICrateGameAggregate): Promise<GameAggregate> {
		const game = this.gameRepository.create(dto);

		await this.gameRepository.save(game);

		return game;
	}
}
