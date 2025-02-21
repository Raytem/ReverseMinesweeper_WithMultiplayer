import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateGameDto } from '@infrastructure/transports/game/http/dto';
import { CreateGameUseCase, GetAllGamesUseCase } from '@usecases/game';

@Controller('/games')
export class HTTPGameController {
	constructor(
		private createGameUseCase: CreateGameUseCase,
		private getAllGamesUseCase: GetAllGamesUseCase
	) {}

	@Post()
	async create(@Body() dto: CreateGameDto) {
		return await this.createGameUseCase.execute(dto);
	}

	@Get()
	async findAll() {
		return await this.getAllGamesUseCase.execute();
	}
}
