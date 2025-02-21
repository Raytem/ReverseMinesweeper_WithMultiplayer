import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { ICustomEventEmitterService } from '@domain/services/custom-event-emitter.service.interface';
import { CellResultEvent } from '@domain/event-emitter-events';

@Injectable()
export class OpenCellUseCase {
	constructor(
		@Inject(IGameRepository.$)
		private readonly gameRepository: IGameRepository,
		@Inject(ICustomEventEmitterService.$)
		private customEventEmitterService: ICustomEventEmitterService,
	) {}

	async execute(userId: string, gameId: string, x: number, y: number): Promise<void> {
		const game = await this.gameRepository.findById(gameId);
		if (!game) {
			throw new NotFoundException();
		}

		const cell = game.openCell(userId, x, y);

		this.customEventEmitterService.emit(CellResultEvent.name, new CellResultEvent(game.id, cell))
	}
}
