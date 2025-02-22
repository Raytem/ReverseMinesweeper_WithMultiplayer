import { GameAggregate } from '@domain/entities/game/game.aggregate';
import { Inject, NotFoundException } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';

export class GetGameByIdUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository
	) {}

	async execute(gameId: string): Promise<GameAggregate> {
		const game = await this.gameRepository.findById(gameId);
		if (!game) {
			throw new NotFoundException();
		}

		return game;
	}
}
