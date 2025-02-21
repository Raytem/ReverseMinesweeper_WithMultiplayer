import { GameStatus } from '@domain/entities/game/enums/game-status.enum';
import { Player } from '@domain/entities/player/player.entity';
import { Cell } from '@domain/entities/cell/cell.entity';
import { DomainError } from '@domain/errors/domain.error';
import { ArrayUtil } from '@domain/utils';
import { AggregateRoot } from '@nestjs/cqrs';
import {
	CellResultEvent,
	GameAbortedEvent, GameEndedEvent,
	GameStartedEvent,
	PlayerConnectedEvent,
	PlayerDisconnectedEvent,
	PlayerScoreUpdatedEvent,
	TurnSwitchedEvent,
} from '@domain/event-emitter-events';

export class GameAggregate extends AggregateRoot {
	static playersCntToStartGame = 2;

	private readonly _id: string;
	private _status: GameStatus;
	private _startTime: Date | null;
	private _players: Player[];
	private _winnerPlayerId: string | null;
	private _nextTurnPlayerId: string | null;
	private readonly _field: Cell[][];

	private readonly _fieldSize: number;
	private readonly _totalDiamonds: number;

	constructor(id: string, fieldSize: number, totalDiamonds: number) {
		super();

		this._id = id;
		this._status = GameStatus.NOT_STARTED;
		this._startTime = null;
		this._players = [];
		this._nextTurnPlayerId = null;
		this._winnerPlayerId = null;
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
		const tempField = Array.from({ length: this._fieldSize }, (_, y) => {
			return Array.from({ length: this._fieldSize }, (_, x) => new Cell(x, y, false, 0, false));
		});

		// shuffling array and setting diamonds to random cells
		ArrayUtil.shuffle(tempField.flat())
			.slice(0, this._totalDiamonds)
			.map((el) => (el.hasDiamond = true));

		return this.setAdjacentDiamonds(tempField);
	}

	private setAdjacentDiamonds(field: Cell[][]): Cell[][] {
		for (let x = 0; x < field.length; x++) {
			for (let y = 0; y < field[x]!.length; y++) {
				let cnt = 0;

				if (x - 1 >= 0 && field[y]![x - 1]!.hasDiamond) cnt++;
				if (x + 1 < this._fieldSize && field[y]![x + 1]!.hasDiamond) cnt++;
				if (y - 1 >= 0 && field[y - 1]![x]!.hasDiamond) cnt++;
				if (y + 1 < this._fieldSize && field[y + 1]![x]!.hasDiamond) cnt++;
				if (x - 1 >= 0 && y - 1 >= 0 && field[y - 1]![x - 1]!.hasDiamond) cnt++;
				if (y + 1 < this._fieldSize && x - 1 >= 0 && field[y + 1]![x - 1]!.hasDiamond) cnt++;
				if (x + 1 < this._fieldSize && y - 1 >= 0 && field[y - 1]![x + 1]!.hasDiamond) cnt++;
				if (x + 1 < this._fieldSize && y + 1 < this._fieldSize && field[y + 1]![x + 1]!.hasDiamond) cnt++;

				field[y]![x]!.adjacentDiamonds = cnt;
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

	get winnerPlayerId(): string | null {
		return this._winnerPlayerId;
	}

	joinGame(player: Player, curDate: Date) {
		if (this._status === GameStatus.ONGOING || this._status === GameStatus.FINISHED) {
			throw new DomainError(`Game already started or finished, cannot join`);
		}

		if (this.players.length >= 2) {
			throw new DomainError(`Max players count in the game is 2`);
		}

		if (this.findPlayerById(player.id)) {
			throw new DomainError(`Player (${player.id}) already connected`);
		}

		this._players.push(player);
		this.apply(new PlayerConnectedEvent(this._id, player.id));

		if (this.players.length === 2) {
			this._status = GameStatus.ONGOING;
			this._startTime = curDate;
			this.apply(new GameStartedEvent(this._id));

			const randomPlayer = this.getRandomPlayer();
			this._nextTurnPlayerId = randomPlayer.id;
			this.apply(new TurnSwitchedEvent(this._id, randomPlayer.id));
		}
	}

	leaveGame(player: Player) {
		this._players = this._players.filter((p) => p.id !== player.id);
		this.apply(new PlayerDisconnectedEvent(this._id, player.id));

		if (this._status === GameStatus.ONGOING) {
			this.apply(new GameAbortedEvent(this._id));
			this._status = GameStatus.FINISHED;
		}
	}

	openCell(userId: string, x: number, y: number): Cell {
		if (this._status !== GameStatus.ONGOING) {
			throw new DomainError('Game is not started or already finished');
		}

		const player = this.findPlayerById(userId);
		if (!player) {
			throw new DomainError(`Player (${userId}) is not a game participant`);
		}

		if (this._nextTurnPlayerId !== player.id) {
			throw new DomainError('Now is not your turn, wait for the opponent');
		}

		if (x > this._fieldSize || y > this._fieldSize || x < 0 || y < 0) {
			throw new DomainError('Provided coordinates are out of field bounds');
		}

		const cell = this._field[y]![x]!;

		if (cell.isOpened) {
			throw new DomainError('Cell already opened');
		} else {
			cell.open()
		}

		let nextTurnPlayerId = player.id;
		if (cell.hasDiamond) {
			player.collectDiamond();
			this.apply(new PlayerScoreUpdatedEvent(this._id, player.id, player.diamondsCollected));

			if (this.areAllDiamondsCollected()) {
				const winner = this.players.reduce((withMaxDiamonds, curPlayer) => {
					if (withMaxDiamonds.diamondsCollected < curPlayer.diamondsCollected) {
						return curPlayer;
					}
					return withMaxDiamonds;
				}, this._players[0]!)

				this._status = GameStatus.FINISHED;
				this._winnerPlayerId = winner.id;

				this.apply(new GameEndedEvent(this._id, winner.id));
			}
		} else {
			const opponent = this.getAnotherPlayer(player.id);
			this._nextTurnPlayerId = opponent.id;
			nextTurnPlayerId = opponent.id;
		}
		this.apply(new TurnSwitchedEvent(this._id, nextTurnPlayerId));

		this.apply(new CellResultEvent(this._id, cell));

		return cell;
	}

	findPlayerById(id: string): Player | null {
		return this._players.find((p) => p.id === id) ?? null;
	}

	checkPlayerParticipation(userId: string): Player | never {
		const player = this.findPlayerById(userId);
		if (!player) {
			throw new DomainError(`Player (${userId}) is not a game participant`);
		}
		return player
	}

	private areAllDiamondsCollected(): boolean {
		const totalCollected = this._players.reduce((acc, player) => acc + player.diamondsCollected, 0)
		return totalCollected === this._totalDiamonds;
	}

	private getAnotherPlayer(playerId: string): Player {
		if (!this._players.length) {
			throw new DomainError('Not enough players to get another');
		}
		return this.players.find((p) => p.id !== playerId)!;
	}

	private getRandomPlayer(): Player {
		if (!this._players.length) {
			throw new DomainError('Not enough players to get random');
		}
		const randomIndex = Math.floor(Math.random() * this._players.length);
		return this._players[randomIndex]!;
	}

	printField() {
		for (let y = 0; y < this._field.length; y++) {
			const log = [];
			for (let x = 0; x < this._field[y]!.length; x++) {
				const cur = this._field[y]![x]!;
				if (cur.hasDiamond) {
					if (cur.isOpened) {
						log.push('[💎]');
					} else {
						log.push('💎');
					}
				} else {
					if (cur.isOpened) {
						log.push(`[${cur.adjacentDiamonds}]`);
					} else {
						log.push(`${cur.adjacentDiamonds}`);
					}

				}
			}
			console.log(`${log.join('\t')}\n`);
		}
	}
}
