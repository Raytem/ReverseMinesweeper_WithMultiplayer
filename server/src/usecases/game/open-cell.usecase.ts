import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class OpenCellUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository,
		private eventPublisher: EventPublisher
	) {}

	async execute(userId: string, gameId: string, x: number, y: number): Promise<void> {
		let game = await this.gameRepository.findById(gameId);
		if (!game) {
			throw new NotFoundException();
		}
		game = this.eventPublisher.mergeObjectContext(game);

		game.openCell(userId, x, y);

		await this.gameRepository.save(game);

		game.commit();

		game.printField(); // TODO: удалить, но сейчас пускай останется для визуализации
	}
}
