import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateGameDto } from '@infrastructure/transports/game/http/dto';
import { CreateGameUseCase, GetAllGamesUseCase } from '@usecases/game';
import { GetGameByIdUseCase } from '@usecases/game/get-game-by-id.usecase';

@Controller('/games')
export class HTTPGameController {
	constructor(
		private createGameUseCase: CreateGameUseCase,
		private getAllGamesUseCase: GetAllGamesUseCase,
		private getGameByIdUseCase: GetGameByIdUseCase
	) {}

	@Post()
	async create(@Body() dto: CreateGameDto) {
		return await this.createGameUseCase.execute(dto);
	}

	@Get()
	async findAll() {
		return await this.getAllGamesUseCase.execute();
	}

	@Get(':gameId')
	async findById(@Param('gameId') gameId: string) {
		return await this.getGameByIdUseCase.execute(gameId);
	}

}
