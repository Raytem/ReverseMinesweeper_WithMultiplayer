import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateGameDto } from '@infrastructure/transports/game/http/dto';
import { GameWithOpenedCellsResponse, ShortGameResponse } from '@infrastructure/transports/game/http/responses';
import { CreateGameUseCase, GetAllGamesUseCase, GetGameByIdUseCase } from '@usecases/game';
import { GameWithOpenedCellsMapper, ShortGameMapper } from '@infrastructure/transports/game/http/mappers';
import { ApiResponse } from '@nestjs/swagger';

@Controller('/games')
export class HTTPGameController {
	constructor(
		private createGameUseCase: CreateGameUseCase,
		private getAllGamesUseCase: GetAllGamesUseCase,
		private getGameByIdUseCase: GetGameByIdUseCase
	) {}

	@Post()
	@ApiResponse({ type: GameWithOpenedCellsResponse, status: 201 })
	async create(@Body() dto: CreateGameDto): Promise<GameWithOpenedCellsResponse> {
		const game = await this.createGameUseCase.execute(dto);
		return GameWithOpenedCellsMapper.map(game);
	}

	@Get()
	@ApiResponse({ type: ShortGameResponse, isArray: true, status: 200 })
	async findAll(): Promise<ShortGameResponse[]> {
		const games = await this.getAllGamesUseCase.execute();
		return games.map((g) => ShortGameMapper.map(g));
	}

	@Get(':gameId')
	@ApiResponse({ type: GameWithOpenedCellsResponse, isArray: true, status: 200 })
	async findById(@Param('gameId') gameId: string): Promise<GameWithOpenedCellsResponse> {
		const game = await this.getGameByIdUseCase.execute(gameId);
		return GameWithOpenedCellsMapper.map(game);
	}
}
