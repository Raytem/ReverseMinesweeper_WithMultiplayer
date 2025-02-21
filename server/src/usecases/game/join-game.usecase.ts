import { Inject, Injectable } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';

@Injectable()
export class JoinGameUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository
	) {}

	async execute(gameId: string, userId: string): Promise<void> {
		this.gameRepository.findAll();
	}
}
