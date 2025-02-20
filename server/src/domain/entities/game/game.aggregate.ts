import { GameStatus } from '@domain/entities/game/enums/game-status.enum';
import { Player } from '@domain/entities/game/player.entity';
import { Cell } from '@domain/entities/game/cell.entity';
import { DomainError } from '@domain/errors/domain.error';

export class GameAggregate {
	private readonly _id: string;
	private _status: GameStatus;
	private _startTime: Date | null;
	private readonly _players: Player[];
	private _nextTurnPlayerId: string | null;
	private readonly _field: Cell[][];

	private readonly _fieldSize: number;

	constructor(id: string, fieldSize: number, totalDiamonds: number) {
		this._id = id;
		this._status = GameStatus.NOT_STARTED;
		this._startTime = null;
		this._players = [];
		this._nextTurnPlayerId = null;
		this._fieldSize = fieldSize;

		this.validateField(fieldSize, totalDiamonds);
		this._field = this.generateField();
	}

	private validateField(fieldSize: number, totalDiamonds: number): void | never {
		const maxFieldSize = 6;
		const minFieldSize = 2;

		if (fieldSize % 2 !== 0) {
			throw new DomainError('Field size must be an even number');
		}
		if (totalDiamonds % 2 === 0) {
			throw new DomainError('Diamonds count must be an odd number');
		}
		if (fieldSize < minFieldSize || fieldSize > maxFieldSize) {
			throw new DomainError(`Field size must be in range ${minFieldSize} - ${maxFieldSize}`);
		}

		const totalCellsCount = Math.pow(fieldSize, 2);
		if (totalDiamonds > totalCellsCount) {
			throw new DomainError('Field size must be grater than diamonds count');
		}
	}

	private generateField(): Cell[][] {
		return [[]] //TODO: make field;
	}

	get id(): string {
		return this._id;
	}

	get status(): GameStatus {
		return this._status;
	}

	get startTime(): Date | null {
		return this._startTime;
	}

	get players(): Player[] {
		return this._players;
	}

	get nextTurnPlayerId(): string | null {
		return this._nextTurnPlayerId;
	}

	get fieldSize(): number {
		return this._fieldSize;
	}

	openCell(userId: string, x: number, y: number) {
		if (x > this._fieldSize || y > this._fieldSize || x < 0 || y < 0) {
			throw new DomainError('Provided coordinates are out of field bounds');
		}

		console.log(this._field, userId, x, y);
	}

}