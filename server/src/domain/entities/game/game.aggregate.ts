import { AggregateRoot } from '@nestjs/cqrs';
import { GameStatus } from '@domain/entities/game/enums/game-status.enum';
import { Player } from '@domain/entities/player/player.entity';
import { Cell } from '@domain/entities/cell/cell.entity';
import { DomainError } from '@domain/errors/domain.error';
import { ArrayUtil } from '@domain/utils';
import {
	CellResultEvent,
	GameAbortedEvent,
	GameEndedEvent,
	GameStartedEvent,
	PlayerConnectedEvent,
	PlayerDisconnectedEvent,
	PlayerScoreUpdatedEvent,
	TurnSwitchedEvent,
} from '@domain/event-emitter-events';

export class GameAggregate extends AggregateRoot {
	private readonly id: string;
	private status: GameStatus;
	private startTime: Date | null;
	private players: Player[];
	private winnerPlayerId: string | null;
	private nextTurnPlayerId: string | null;
	private readonly field: Cell[][];

	private readonly fieldSize: number;
	private readonly totalDiamonds: number;

	constructor(id: string, fieldSize: number, totalDiamonds: number) {
		super();

		this.id = id;
		this.status = GameStatus.NOT_STARTED;
		this.startTime = null;
		this.players = [];
		this.nextTurnPlayerId = null;
		this.winnerPlayerId = null;
		this.fieldSize = fieldSize;
		this.totalDiamonds = totalDiamonds;

		this.validateField(fieldSize, totalDiamonds);
		this.field = this.generateField();
	}

	getId(): string {
		return this.id;
	}

	getStatus(): GameStatus {
		return this.status;
	}

	getStartTime(): Date | null {
		return this.startTime;
	}

	getPlayers(): Player[] {
		return this.players;
	}

	getField(): Cell[][] {
		return this.field;
	}

	getNextTurnPlayerId(): string | null {
		return this.nextTurnPlayerId;
	}

	getFieldSize(): number {
		return this.fieldSize;
	}

	getTotalDiamonds(): number {
		return this.totalDiamonds;
	}

	getWinnerPlayerId(): string | null {
		return this.winnerPlayerId;
	}

	private validateField(fieldSize: number, totalDiamonds: number): void | never {
		const maxFieldSize = 6;
		const minFieldSize = 2;

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
		const tempField = Array.from({ length: this.fieldSize }, (_, y) => {
			return Array.from({ length: this.fieldSize }, (_, x) => new Cell(x, y, false, 0, false));
		});

		// shuffling array and setting diamonds to random cells
		ArrayUtil.shuffle(tempField.flat())
			.slice(0, this.totalDiamonds)
			.map((cell) => cell.setHasDiamond(true));

		return this.setAdjacentDiamonds(tempField);
	}

	private setAdjacentDiamonds(field: Cell[][]): Cell[][] {
		for (let x = 0; x < field.length; x++) {
			for (let y = 0; y < field[x]!.length; y++) {
				let cnt = 0;

				if (x - 1 >= 0 && field[y]![x - 1]!.getHasDiamond()) cnt++;
				if (x + 1 < this.fieldSize && field[y]![x + 1]!.getHasDiamond()) cnt++;
				if (y - 1 >= 0 && field[y - 1]![x]!.getHasDiamond()) cnt++;
				if (y + 1 < this.fieldSize && field[y + 1]![x]!.getHasDiamond()) cnt++;
				if (x - 1 >= 0 && y - 1 >= 0 && field[y - 1]![x - 1]!.getHasDiamond()) cnt++;
				if (y + 1 < this.fieldSize && x - 1 >= 0 && field[y + 1]![x - 1]!.getHasDiamond()) cnt++;
				if (x + 1 < this.fieldSize && y - 1 >= 0 && field[y - 1]![x + 1]!.getHasDiamond()) cnt++;
				if (x + 1 < this.fieldSize && y + 1 < this.fieldSize && field[y + 1]![x + 1]!.getHasDiamond()) cnt++;

				field[y]![x]!.setAdjacentDiamonds(cnt);
			}
		}

		return field;
	}

	joinGame(player: Player, curDate: Date) {
		if (this.status === GameStatus.ONGOING || this.status === GameStatus.FINISHED) {
			throw new DomainError(`Game already started or finished, cannot join`);
		}

		if (this.players.length >= 2) {
			throw new DomainError(`Max players count in the game is 2`);
		}

		if (this.findPlayerById(player.getId())) {
			throw new DomainError(`Player (${player.getId()}) already connected`);
		}

		this.players.push(player);
		this.apply(new PlayerConnectedEvent(this.id, player.getId()));

		if (this.players.length === 2) {
			this.status = GameStatus.ONGOING;
			this.startTime = curDate;
			this.apply(new GameStartedEvent(this.id));

			const randomPlayer = this.getRandomPlayer();
			this.nextTurnPlayerId = randomPlayer.getId();
			this.apply(new TurnSwitchedEvent(this.id, randomPlayer.getId()));
		}
	}

	leaveGame(player: Player) {
		this.players = this.players.filter((p) => p.getId() !== player.getId());
		this.apply(new PlayerDisconnectedEvent(this.id, player.getId()));

		console.log('LEAVE GAME, status', this.status);

		if (this.status === GameStatus.ONGOING) {
			this.status = GameStatus.FINISHED;
			this.apply(new GameAbortedEvent(this.id));
		}
	}

	openCell(userId: string, x: number, y: number): Cell {
		if (this.status !== GameStatus.ONGOING) {
			throw new DomainError('Game is not started or already finished');
		}

		const player = this.findPlayerById(userId);
		if (!player) {
			throw new DomainError(`Player (${userId}) is not a game participant`);
		}

		if (this.nextTurnPlayerId !== player.getId()) {
			throw new DomainError('Now is not your turn, wait for the opponent');
		}

		if (x > this.fieldSize || y > this.fieldSize || x < 0 || y < 0) {
			throw new DomainError('Provided coordinates are out of field bounds');
		}

		const cell = this.field[y]![x]!;

		if (cell.getIsOpened()) {
			throw new DomainError('Cell already opened');
		} else {
			cell.open();
		}

		let nextTurnPlayerId = player.getId();
		if (cell.getHasDiamond()) {
			player.collectDiamond();
			this.apply(new PlayerScoreUpdatedEvent(this.id, player.getId(), player.getDiamondsCollected()));

			if (this.areAllDiamondsCollected()) {
				const winner = this.players.reduce((withMaxDiamonds, curPlayer) => {
					if (withMaxDiamonds.getDiamondsCollected() < curPlayer.getDiamondsCollected()) {
						return curPlayer;
					}
					return withMaxDiamonds;
				}, this.players[0]!);

				this.status = GameStatus.FINISHED;
				this.winnerPlayerId = winner.getId();

				this.apply(new GameEndedEvent(this.id, winner.getId()));
			}
		} else {
			const opponent = this.getAnotherPlayer(player.getId());
			this.nextTurnPlayerId = opponent.getId();
			nextTurnPlayerId = opponent.getId();
		}
		this.apply(new TurnSwitchedEvent(this.id, nextTurnPlayerId));

		this.apply(new CellResultEvent(this.id, cell));

		return cell;
	}

	findPlayerById(id: string): Player | null {
		return this.players.find((p) => p.getId() === id) ?? null;
	}

	checkPlayerParticipation(userId: string): Player | never {
		const player = this.findPlayerById(userId);
		if (!player) {
			throw new DomainError(`Player (${userId}) is not a game participant`);
		}
		return player;
	}

	private areAllDiamondsCollected(): boolean {
		const totalCollected = this.players.reduce((acc, player) => acc + player.getDiamondsCollected(), 0);
		return totalCollected === this.totalDiamonds;
	}

	private getAnotherPlayer(playerId: string): Player {
		if (!this.players.length) {
			throw new DomainError('Not enough players to get another');
		}
		return this.players.find((p) => p.getId() !== playerId)!;
	}

	private getRandomPlayer(): Player {
		if (!this.players.length) {
			throw new DomainError('Not enough players to get random');
		}
		const randomIndex = Math.floor(Math.random() * this.players.length);
		return this.players[randomIndex]!;
	}

	printField() {
		console.log(`----Field of game: ${this.id}\n`);

		function getCellView(hasDiamond: boolean, adjacentDiamonds: number, isOpened: boolean): string {
			const inner = hasDiamond ? '💎' : adjacentDiamonds.toString();
			return isOpened ? `[${inner}]` : inner;
		}

		for (let y = 0; y < this.field.length; y++) {
			const log = [];
			for (let x = 0; x < this.field[y]!.length; x++) {
				const cell = this.field[y]![x]!;
				const view = getCellView(cell.getHasDiamond(), cell.getAdjacentDiamonds(), cell.getIsOpened());
				log.push(view);
			}
			console.log(`${log.join('\t')}\n`);
		}
	}
}
