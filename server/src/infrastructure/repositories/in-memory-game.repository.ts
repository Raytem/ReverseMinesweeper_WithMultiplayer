import { IGameRepository } from '@domain/entities/game/repositories/game.repository.interface';
import { GameAggregate } from '@domain/entities/game/game.aggregate';
import { ICrateGameAggregate } from '@domain/entities/game/interfaces/create-game-aggregate.interface';
import { randomUUID } from 'crypto';

export class InMemoryGameRepository implements IGameRepository {
	private storage = new Map<string, GameAggregate>();

	async findAll(): Promise<GameAggregate[]> {
		const games = Array.from(this.storage.values());
		return Promise.resolve(games);
	}

	async findById(id: string): Promise<GameAggregate | null> {
		const game = this.storage.get(id) ?? null;
		return Promise.resolve(game);
	}

	create(createDto: ICrateGameAggregate): GameAggregate {
		const game = new GameAggregate(randomUUID(), createDto.fieldSize, createDto.totalDiamonds);
		return game;
	}

	async save(game: GameAggregate): Promise<void> {
		this.storage.set(game.getId(), game);
	}
}
