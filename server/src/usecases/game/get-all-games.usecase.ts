import { Inject, Injectable } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { GameAggregate } from '@domain/entities/game/game.aggregate';

@Injectable()
export class GetAllGamesUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository
	) {}

	async execute(): Promise<GameAggregate[]> {
		return await this.gameRepository.findAll();
	}
}
