import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { Player } from '@domain/entities/player/player.entity';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class JoinGameUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository,
		private eventPublisher: EventPublisher
	) {}

	async execute(gameId: string, userId: string): Promise<void> {
		let game = await this.gameRepository.findById(gameId);
		if (!game) {
			throw new NotFoundException();
		}
		game = this.eventPublisher.mergeObjectContext(game);

		const player = new Player(userId);
		game.joinGame(player, new Date());

		await this.gameRepository.save(game);
		game.commit();
	}
}
