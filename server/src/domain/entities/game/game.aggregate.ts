import { GameStatus } from '@domain/entities/game/enums/game-status.enum';
import { Player } from '@domain/entities/player/player.entity';
import { Cell } from '@domain/entities/cell/cell.entity';
import { DomainError } from '@domain/errors/domain.error';
import { ArrayUtil } from '@domain/utils';

export class GameAggregate {
	private readonly _id: string;
	private _status: GameStatus;
	private _startTime: Date | null;
	private readonly _players: Player[];
	private _nextTurnPlayerId: string | null;
	private readonly _field: Cell[][];

	private readonly _fieldSize: number;
	private readonly _totalDiamonds: number;

	constructor(id: string, fieldSize: number, totalDiamonds: number) {
		this._id = id;
		this._status = GameStatus.NOT_STARTED;
		this._startTime = null;
		this._players = [];
		this._nextTurnPlayerId = null;
		this._fieldSize = fieldSize;
		this._totalDiamonds = totalDiamonds;

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
		const tempField = Array.from(
			{ length: this._fieldSize },
			(_, y) => {
				return Array.from(
					{ length: this._fieldSize },
					(_, x) => new Cell(x, y, false, 0, false)
				)
			}
		)

		// shuffling array and setting diamonds to random cells
		ArrayUtil.shuffle(tempField.flat()).slice(0, this._totalDiamonds).map(el => el.hasDiamond = true)

		return this.setAdjacentDiamonds(tempField);
	}

	private setAdjacentDiamonds(field: Cell[][]): Cell[][] {
		for (let x = 0; x < field.length; x++) {
			for (let y = 0; y < field[x]!.length; y++) {
				let cnt = 0

				if (x - 1 >= 0 && field[x - 1]![y]!.hasDiamond) cnt++
				if (x + 1 < this._fieldSize && field[x + 1]![y]!.hasDiamond) cnt++
				if (y - 1 >= 0 && field[x]![y - 1]!.hasDiamond) cnt++
				if (y + 1 < this._fieldSize && field[x]![y + 1]!.hasDiamond) cnt++
				if (x - 1 >= 0 && y - 1 >= 0 && field[x - 1]![y - 1]!.hasDiamond) cnt++
				if (y + 1 < this._fieldSize && x - 1 >= 0 && field[x - 1]![y + 1]!.hasDiamond) cnt++
				if (x + 1 < this._fieldSize && y - 1 >= 0 && field[x + 1]![y - 1]!.hasDiamond) cnt++
				if (x + 1 < this._fieldSize && y + 1 < this._fieldSize && field[x + 1]![y + 1]!.hasDiamond) cnt++

				field[x]![y]!.adjacentDiamonds = cnt;
			}
		}

		return field;
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

	openCell(userId: string, x: number, y: number): Cell {
		if (x > this._fieldSize || y > this._fieldSize || x < 0 || y < 0) {
			throw new DomainError('Provided coordinates are out of field bounds');
		}

		const cell = this._field[x]![y]!;

		if (cell.isOpened) {
			throw new DomainError('Cell already opened');
		}

		if (!cell.hasDiamond) {
			// this._nextTurnPlayerId = //TODO
		}

		return cell;
	}

	public printField() {
		for (let x = 0; x < this._field.length; x++) {
			const log = []
			for (let y = 0; y < this._field[x]!.length; y++) {
				const cur = this._field[x]![y]!;
				if (cur.hasDiamond) {
					log.push('💎')
				} else {
					log.push(`${cur.adjacentDiamonds}`)
				}
			}
			console.log(`${log.join('\t')}\n`)
		}
	}
}
