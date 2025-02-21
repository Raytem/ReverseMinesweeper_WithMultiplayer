import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class LeaveGameUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository,
		private readonly eventPublisher: EventPublisher
	) {}

	async execute(gameId: string, userId: string): Promise<void> {
		let game = await this.gameRepository.findById(gameId);
		if (!game) {
			throw new NotFoundException();
		}
		game = this.eventPublisher.mergeObjectContext(game);

		const player = game.checkPlayerParticipation(userId);
		game.leaveGame(player)
	}
}
