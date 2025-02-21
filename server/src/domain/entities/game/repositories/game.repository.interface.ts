import { GameAggregate } from '@domain/entities/game/game.aggregate';
import { ICrateGameAggregate } from '@domain/entities/game/interfaces/create-game-aggregate.interface';

export interface IGameRepository {
	findAll(): Promise<GameAggregate[]>;

	findById(id: string): Promise<GameAggregate | null>;

	create(createDto: ICrateGameAggregate): GameAggregate;

	save(game: GameAggregate): Promise<void>;
}

export namespace IGameRepository {
	export const $ = Symbol('IGameRepository');
}
